# Anreicherung des K10plus mit DDC-Zerlegungen

Dieses Verzeichnis enthält Skripte zur Anreicherung des K10plus-Katalog um im Rahmen des Projekt coli-ana ermittelte Analysen von DDC-Notationen.

## Installation

    cpanm --installdeps .

## Benutzung

Das Skript `enrich.pl` ermittelt per coli-ana API die Zerlegung einer übergebenen DDC-Notation und reichert anschließend per STDIN übergebene PICA-Datensätze mit dieser Notation um die Zerlegung an. Die Ausgabe erfolgt im PICA-Änderungsformat.

Beispiel (ausgehend von einer PPN):

    ./search-ppn 276856457 | ./enrich.pl 709.044

Beispiel für mehrere Datensätze (ausgehend von einer oder mehreren DDC-Notationen):

    ./enrich-with-ddc 700.23

Letzterer Befehl läd mit `search-ddc` per SRU Datensätze aus dem K10plus, reichert sie mit `enrich.pl` an stellt mi `picadata -s avram.json` sicher, dass die Formatrichtlinien eingehalten werden.

Das Avram-Schema der Felder 003@, 045F und 045F kann bei Bedarf so aktualisiert werden:

    curl 'https://format.k10plus.de/avram.pl?profile=&field=003@|045H|045F' > avram.json`

