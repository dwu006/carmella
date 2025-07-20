#!/bin/bash
git lfs install
git remote set-url origin https://github.com/dwu006/carmella.git
git lfs pull
npm run build
