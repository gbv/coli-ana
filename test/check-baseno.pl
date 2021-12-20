#!/usr/bin/env perl
use v5.14.1;

# Parse MARC field 765 from test cases and check whether the same base number
# is returned via coli-ana API.

my %test;

while (<>) {
    next if $_ !~ /^765_(\d+)\[\d+\]: 765 0#  \$b([^ ]+).+\$u([^ ]+)/;

    # say "$1 : $3 => $2";

    if ( $test{$1} ) {
        if ( length $test{$1}->{notation} == length $3 ) {
            $test{$1}->{notation} .= "-$3";
        }
    }
    else {
        $test{$1} = { notation => $3 };
    }
    $test{$1}->{base} = $2;
}

for ( sort { $a <=> $b } keys %test ) {
    my $notation = $test{$_}->{notation};
    my $base     = $test{$_}->{base};

    next if $notation =~ /^\d{4,}$/;    # malformed DDC

    next if defined $test{$_}->{status};
    $test{$_}->{status} = "?";

    my $pica =
`curl --silent 'https://coli-conc.gbv.de/coli-ana/app/analyze?notation=$notation&format=pp'`;

    if ($pica) {
        $pica =~ /\$c([^\$]+)/;
        $test{$_}->{status} = ( $base eq $1 ) ? 'OK' : "NOT $1";
    }
    else {
        $test{$_}->{status} = "?";
    }

    say "$_: $notation => " . $test{$_}->{base} . " " . $test{$_}->{status};
}
