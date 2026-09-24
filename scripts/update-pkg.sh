#!/bin/bash

# Extract package.json values
NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")
DESCRIPTION=$(node -p "require('./package.json').description")

# Update pkg.ts with extracted values
cat > src/constants/pkg.ts << EOF
interface PackageJson {
  name: string;
  version: string;
  description: string;
}

const pkg: PackageJson = {
  name: '$NAME',
  version: '$VERSION',
  description: '$DESCRIPTION',
};

export default pkg;
EOF

echo "✓ Updated src/constants/pkg.ts with package.json values"
