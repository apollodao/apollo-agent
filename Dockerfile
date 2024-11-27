FROM node:23.1.0
# Install pnpm globally
RUN npm install -g pnpm@9.4.0

# Set the working directory
WORKDIR /app

# Add configuration files and install dependencies
ADD pnpm-workspace.yaml /app/pnpm-workspace.yaml
ADD package.json /app/package.json
ADD .npmrc /app/.npmrc
ADD tsconfig.json /app/tsconfig.json
ADD pnpm-lock.yaml /app/pnpm-lock.yaml
RUN pnpm i

# Add the documentation
ADD docs /app/docs
RUN pnpm i

# Add the rest of the application code
ADD packages /app/packages
RUN pnpm i

# Add the environment variables and other files
ADD scripts /app/scripts
ADD characters /app/characters
ADD .env /app/.env

# Build the applications
RUN pnpm build

# Expose the necessary ports (adjust these based on your actual ports)
EXPOSE 3000

# Create a startup script
RUN echo "#!/bin/bash\n\
pnpm --filter agent start\
" > /app/start.sh
RUN chmod +x /app/start.sh

# Command to run the container
CMD ["/app/start.sh"]