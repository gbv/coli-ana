#!/usr/bin/env perl
use v5.14;
use PICA::Data qw(1.20 :all);
use List::Util qw(uniq min);
use Pod::Usage;
use HTTP::Tiny;

my $ddc = shift @ARGV;
$ddc =~ /^[0-9]{3}\.[0-9]+$/
  or die "'$ddc' ist keine DDC-Notation mit mindestens vier Ziffern.\n";

# get analysis via coli-ana API
my $url =
"https://coli-conc.gbv.de/coli-ana/app/analyze?notation=$ddc&complete=1&format=pp";
my $analysis;
my $res = HTTP::Tiny->new->get($url);
if ( $res->{success} ) {
    $analysis =
      pica_parser( 'plain', bless => 1, fh => \$res->{content} )->next;
    $analysis = $analysis->fields('045H')->[0] if $analysis;
}
unless ($analysis) {
    say STDERR "Keine vollständige Analyse für DDC '$ddc' bekannt";
    exit 1;
}

my $parser = pica_parser( 'plain', bless => 1 );
my $writer = pica_writer( 'plain', annotated => 1 );

RECORD: while ( my $record = $parser->next ) {
    my $ppn = $record->{_id};
    unless ($ppn) {
        say STDERR "Datensatz enthält keine PPN";
        next;
    }

    my @diff = @{ $record->fields('003@') };

    # collect unique DDC notations in the record
    my @notations = uniq
      map { ( $_ => 1 ) }
      map { $_ =~ s/['\/]//gr }    # remove ' and / in DDC notations
      $record->values('045F$a'), $record->values('045H$a');

    # skip if record does not contain analyzed DDC notation
    unless ( grep { $_ eq $ddc } @notations ) {
        say STDERR "Datensatz $ppn enhtält nicht die DDC-Notation $ddc";
        next;
    }

    # check existing use of 045H in the record
    my @stored = @{ $record->fields('045H') };
    my %occurrences = map { ( $_ => $_ ) } 10 .. 19;
    for (@stored) {
        delete $occurrences{ $_->[1] };

        # check if coli-ana already in the record
        my %sf = @$_;
        if ( $sf{a} eq $ddc && $sf{A} eq 'DE-601' ) {
            say STDERR "Datensatz $ppn wurde bereits mit DDC '$ddc' analysiert";

            # TODO: check whether existing analysis differs

            next RECORD;
        }
    }

    my $occ = min keys %occurrences;
    unless ($occ) {
        say STDERR "Datensatz $ppn hat keine freien Occurrences in 045F/10-19";
        next;
    }

    $analysis->[1] = $occ;

    push @diff, [ @$analysis, '+' ];

    $writer->write( \@diff );
}
