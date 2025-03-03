#!/bin/bash
# Doc/renderDiagrams.sh

# Create output directory
mkdir -p images/diagrams

# Find all .mmd files in the diagrams directory
find diagrams -name "*.mmd" -type f | while read -r diagram; do
  # Get basename without extension
  basename=$(basename "$diagram" .mmd)

  # Check if PNG already exists
  if [ ! -f "images/diagrams/$basename.png" ]; then
    echo "Processing $diagram"

    # Convert to PNG using npx with light theme
    npx @mermaid-js/mermaid-cli -i "$diagram" -o "images/diagrams/$basename.png" -t default -b transparent

    # Check if conversion was successful
    if [ $? -eq 0 ]; then
      echo "Created images/diagrams/$basename.png"
    else
      echo "Failed to create images/diagrams/$basename.png"
    fi
  else
    echo "Skipping $diagram - PNG already exists"
  fi
done

echo "All diagrams processed"
