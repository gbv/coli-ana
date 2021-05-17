# Anreicherung des K10plus mit DDC-Zerlegungen

Dieses Verzeichnis enthält Skripte zur Anreicherung des K10plus-Katalog um im Rahmen des Projekt coli-ana ermittelte Analysen von DDC-Notationen.

## Installation

    cpanm --installdeps .

## Benutzung

Das Skript `enrich.pl` ermittelt per coli-ana API die Zerlegung einer übergebenen DDC-Notation und reichert anschließend per STDIN übergebene PICA-Datensätze mit dieser Notation um die Zerlegung an. Die Ausgabe erfolgt im PICA-Änderungsformat.

Beispiel (ausgehend von einer PPN):

    ./record-with-ppn 276856457 | ./enrich.pl 709.044

Beispiel für mehrere Datensätze (ausgehend von einer DDC-Notation):

    ./enrich-with-ddc 700.23
    ./records-with-ddc 700.23 | ./enrich.pl 700.23  # equivalent

Zur Sicherheit sollte die Ausgabe gegen das Katalogisierungsformat validiert werden:

    picadata -s ./avram.json -u output.pica

Das Avram-Schema der Felder 003@, 045F und 045F kann bei Bedarf so aktualisiert werden:

    curl 'https://format.k10plus.de/avram.pl?profile=&field=003@|045H|045F' > avram.json`

