#!/bin/bash
catmandu convert kxp --query "pica.ddc=$1" to pp | picadata -p '003@|045F|045H'
