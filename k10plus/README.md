# Anreicherung des K10plus mit DDC-Zerlegungen

Dieses Verzeichnis enthält Skripte umd den K10plus-Katalog um im Rahmen des Projekt coli-ana ermittelten DDC-Zerlegungen anzureichern.

* `cpanfile` Perl-Dependencies (`cpanm --installdeps .`)
* `catmandu.yaml` Konfigurationsdatei
* `avram.json` Avram-Schema der Felder 003@, 045F und 045F (`curl 'https://format.k10plus.de/avram.pl?profile=&field=003@|045H|045F' > avram.json`)
*  `./download-by-ddc.sh` läd ausgehend von einer DDC-Notation Titeldatensätze beschränkt auf DDC-Felder aus dem K10plus.
* ...

## Beispiele

    ./download-by-ddc.sh 700.23
