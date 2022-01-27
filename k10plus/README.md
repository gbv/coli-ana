# Anreicherung des K10plus mit DDC-Zerlegungen

Dieses Verzeichnis enthält Skripte zur Anreicherung des K10plus-Katalog um im Rahmen des Projekt coli-ana ermittelte Analysen von DDC-Notationen.

## Installation

    cpanm --installdeps .

## Benutzung

### coli-ana-enrich

Mit dem Skript `coli-ana-enrich` können vorhandene PICA+ Datensätze oder Datensätze aus dem K10plus über die coli-ana API um Zerlegungen angereichert werden.

### Altere Skripte

Das Skript `enrich.pl` ermittelt per coli-ana API die Zerlegung einer übergebenen DDC-Notation und reichert anschließend per STDIN übergebene PICA-Datensätze mit dieser Notation um die Zerlegung an. Die Ausgabe erfolgt im PICA-Änderungsformat.

Beispiel (ausgehend von einer PPN):

    ./search-ppn 276856457 | ./enrich.pl 709.044

Beispiel für mehrere Datensätze (ausgehend von einer oder mehreren DDC-Notationen):

    ./enrich-with-ddc 700.23

Letzterer Befehl läd mit `search-ddc` per SRU Datensätze aus dem K10plus, reichert sie mit `enrich.pl` an stellt mi `picadata -s avram.json` sicher, dass die Formatrichtlinien eingehalten werden. Die Reihenfolge der Unterfelder wird momentan nicht überprüft.

Das Skript `enrich-all` liesst DDC-Nummern von der Standardeingabe, ermittelt dazu passende Datensätze und ihre Anreicherung und speichert diese in Dateien im Verzeichnis `pica/`. Um die Anreicherung für alle bekannten DDC-Nummer zu ermitteln und zu speichern:

    jq -r .notation[0] ../public/dump.ndjson | ./enrich-all

