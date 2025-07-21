#!/bin/bash
git lfs install
git remote add origin https://github.com/dwu006/carmella.git
git lfs pull
npm run build
