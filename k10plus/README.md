# Anreicherung des K10plus mit DDC-Zerlegungen

Dieses Verzeichnis enthält Skripte zur Anreicherung des K10plus-Katalog um im Rahmen des Projekt coli-ana ermittelte Analysen von DDC-Notationen (siehe [coli-ana Homepage](https://coli-conc.gbv.de/coli-ana/)).

## Installation

Die Skripte sind größtenteils in Perl geschrieben. Unter Ubuntu empfiehlt es sich, den Hauptteil in Form von Debian-Paketen zu installieren und dann den Rest mittels `cpanm`:

    sudo apt-get install cpanminus libcatmandu-perl libcatmandu-sru-perl libdbd-sqlite3-perl
    cpanm --installdeps .

## Benutzung

Mit dem Skript `coli-ana-enrich` können vorhandene PICA+ Datensätze oder Datensätze aus dem K10plus über die coli-ana API um Zerlegungen angereichert werden. Die Ergebnisse werden im PICA-Änderungsformat ausgegeben.

Beispiel (ausgehend von einer PPN):

    ./search-ppn 276856457 | ./coli-ana-enrich 709.044

Beispiel für mehrere Datensätze (ausgehend von einer oder mehreren DDC-Notationen):

    ./coli-ana-enrich -q 700.23

Letzterer Befehl läd per SRU Datensätze aus dem K10plus und reichert sie mit der Zerlegung von Notation `7002.3` an.

Damit die gleiche Notation nicht immer wieder zerlegt werden muss, können die Ergebnisse in einer Cache-Datei gespeichert werden (Option `--sqlite`). Der Inhalt des Cache lässt sich so anzeigen:

    echo "SELECT * FROM coli_ana" | sqlite3 cache.sqlite

Das Skript `enrich-all` liesst DDC-Nummern von der Standardeingabe, ermittelt dazu passende Datensätze und ihre Anreicherung und speichert diese in Dateien im Verzeichnis `pica/`. Um die Anreicherung für alle bekannten DDC-Nummer zu ermitteln und zu speichern:

    jq -r .notation[0] ../public/dump.ndjson | ./enrich-all

