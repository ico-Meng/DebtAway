# Force x86_64 platform for consistent TeX Live binary architecture
FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.13

# Install system dependencies for TeX Live
# Note: AWS Lambda Python 3.13 base image uses Amazon Linux 2023 with dnf
RUN dnf update -y && \
    dnf install -y wget perl tar gcc gcc-c++ make && \
    dnf clean all

# Install minimal TeX Live distribution
# Use TEXLIVE_YEAR to handle yearly updates dynamically
ENV TEXLIVE_YEAR=2025
RUN set -x && \
    cd /tmp && \
    echo "=== Downloading TeX Live installer ===" && \
    wget -q https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz && \
    tar -xzf install-tl-unx.tar.gz && \
    rm -f install-tl-unx.tar.gz && \
    cd install-tl-* && \
    echo "=== Creating TeX Live profile ===" && \
    echo "selected_scheme scheme-basic" > texlive.profile && \
    echo "TEXDIR /usr/local/texlive/${TEXLIVE_YEAR}" >> texlive.profile && \
    echo "TEXMFLOCAL /usr/local/texlive/texmf-local" >> texlive.profile && \
    echo "TEXMFHOME ~/texmf" >> texlive.profile && \
    echo "TEXMFVAR /usr/local/texlive/${TEXLIVE_YEAR}/texmf-var" >> texlive.profile && \
    echo "TEXMFCONFIG ~/.texlive${TEXLIVE_YEAR}/texmf-config" >> texlive.profile && \
    echo "instopt_adjustpath 0" >> texlive.profile && \
    echo "instopt_adjustrepo 1" >> texlive.profile && \
    echo "instopt_letter 0" >> texlive.profile && \
    echo "instopt_portable 0" >> texlive.profile && \
    echo "tlpdbopt_autobackup 0" >> texlive.profile && \
    echo "tlpdbopt_desktop_integration 0" >> texlive.profile && \
    echo "tlpdbopt_file_assocs 0" >> texlive.profile && \
    echo "tlpdbopt_post_code 1" >> texlive.profile && \
    cat texlive.profile && \
    echo "=== Installing TeX Live (this may take a few minutes) ===" && \
    ./install-tl -profile texlive.profile -no-interaction && \
    echo "=== TeX Live installation completed ===" && \
    echo "Checking installation directories..." && \
    ls -la /usr/local/texlive/ && \
    ls -la /usr/local/texlive/${TEXLIVE_YEAR}/bin/ 2>/dev/null || ls -la /usr/local/texlive/*/bin/ 2>/dev/null && \
    TEX_BIN_CHECK=$(find /usr/local/texlive -type d -name "*linux" 2>/dev/null | head -1) && \
    echo "Found TEX_BIN_CHECK: $TEX_BIN_CHECK" && \
    if [ -n "$TEX_BIN_CHECK" ] && [ -f "$TEX_BIN_CHECK/pdflatex" ]; then \
        echo "TeX Live installation successful, pdflatex found at: $TEX_BIN_CHECK/pdflatex"; \
        $TEX_BIN_CHECK/pdflatex --version; \
    else \
        echo "ERROR: pdflatex not found after installation!"; \
        find /usr/local/texlive -name pdflatex 2>/dev/null || echo "pdflatex not found anywhere"; \
        exit 1; \
    fi && \
    $TEX_BIN_CHECK/tlmgr path add || echo "Warning: tlmgr path add failed" && \
    cd / && \
    rm -rf /tmp/install-tl-* && \
    # Clean up TeX Live documentation and source files to reduce image size
    find /usr/local/texlive -name "*.pdf" -not -path "*/bin/*" -delete 2>/dev/null || true && \
    find /usr/local/texlive -name "*.tex" -not -path "*/bin/*" -delete 2>/dev/null || true && \
    find /usr/local/texlive -name "*.dtx" -not -path "*/bin/*" -delete 2>/dev/null || true && \
    find /usr/local/texlive -name "*.ins" -not -path "*/bin/*" -delete 2>/dev/null || true && \
    find /usr/local/texlive/*/texmf-dist/doc -type f -delete 2>/dev/null || true

# Install required LaTeX packages for resume template
# These packages are REQUIRED for the resume generation to work
RUN set -x && \
    TEX_BIN_DIR=$(find /usr/local/texlive -type d -name "*linux" 2>/dev/null | head -1) && \
    if [ -z "$TEX_BIN_DIR" ]; then \
        echo "ERROR: TeX Live bin directory not found!"; \
        exit 1; \
    fi && \
    echo "Found TeX Live bin directory: $TEX_BIN_DIR" && \
    export PATH="$TEX_BIN_DIR:$PATH" && \
    echo "=== Configuring tlmgr repository ===" && \
    $TEX_BIN_DIR/tlmgr option repository https://mirror.ctan.org/systems/texlive/tlnet && \
    echo "=== Updating tlmgr ===" && \
    $TEX_BIN_DIR/tlmgr update --self && \
    echo "=== Installing required LaTeX packages ===" && \
    PACKAGES="enumitem setspace geometry hyperref xcolor titlesec ulem paralist framed tocloft indentfirst fancyhdr lastpage fontenc inputenc" && \
    for pkg in $PACKAGES; do \
        echo "Installing package: $pkg"; \
        $TEX_BIN_DIR/tlmgr install $pkg || echo "Warning: Failed to install $pkg, continuing..."; \
    done && \
    echo "=== Verifying critical packages ===" && \
    $TEX_BIN_DIR/tlmgr path add && \
    # Verify enumitem is installed (critical package)
    if $TEX_BIN_DIR/kpsewhich enumitem.sty > /dev/null 2>&1; then \
        echo "SUCCESS: enumitem.sty found at: $($TEX_BIN_DIR/kpsewhich enumitem.sty)"; \
    else \
        echo "ERROR: enumitem.sty not found! Attempting direct installation..."; \
        $TEX_BIN_DIR/tlmgr install enumitem --reinstall && \
        if $TEX_BIN_DIR/kpsewhich enumitem.sty > /dev/null 2>&1; then \
            echo "SUCCESS: enumitem.sty installed at: $($TEX_BIN_DIR/kpsewhich enumitem.sty)"; \
        else \
            echo "FATAL: Could not install enumitem.sty - build cannot continue"; \
            exit 1; \
        fi; \
    fi && \
    # Verify setspace is installed
    if $TEX_BIN_DIR/kpsewhich setspace.sty > /dev/null 2>&1; then \
        echo "SUCCESS: setspace.sty found at: $($TEX_BIN_DIR/kpsewhich setspace.sty)"; \
    else \
        echo "WARNING: setspace.sty not found"; \
    fi && \
    echo "=== Package installation completed ===" && \
    $TEX_BIN_DIR/tlmgr list --only-installed | head -20

# Find TeX Live binary directory and create symlinks for easier access
# This step MUST succeed - fail the build if pdflatex is not found
RUN set -x && \
    echo "=== Finding TeX Live binaries ===" && \
    echo "Searching for pdflatex in /usr/local/texlive..." && \
    find /usr/local/texlive -name "pdflatex" 2>/dev/null && \
    TEX_BIN_DIR=$(find /usr/local/texlive -type d -name "*linux" 2>/dev/null | head -1) && \
    echo "Found TEX_BIN_DIR: $TEX_BIN_DIR" && \
    if [ -n "$TEX_BIN_DIR" ] && [ -f "$TEX_BIN_DIR/pdflatex" ]; then \
        echo "Creating symlinks from $TEX_BIN_DIR..." && \
        ln -sf "$TEX_BIN_DIR/pdflatex" /usr/local/bin/pdflatex && \
        ln -sf "$TEX_BIN_DIR/latex" /usr/local/bin/latex 2>/dev/null || true && \
        echo "Verifying symlink..." && \
        ls -la /usr/local/bin/pdflatex && \
        echo "Testing pdflatex execution..." && \
        /usr/local/bin/pdflatex --version && \
        echo "=== Symlinks created and verified successfully ==="; \
    else \
        echo "=== ERROR: pdflatex not found ===" && \
        echo "TEX_BIN_DIR value: '$TEX_BIN_DIR'" && \
        echo "Contents of /usr/local/texlive/:" && \
        ls -la /usr/local/texlive/ 2>/dev/null || echo "Directory not found" && \
        find /usr/local/texlive -type d -name "bin" -exec ls -la {} \; 2>/dev/null || echo "No bin directories found" && \
        echo "All pdflatex locations:" && \
        find /usr/local -name "pdflatex" 2>/dev/null || echo "No pdflatex found anywhere" && \
        echo "Build cannot continue without pdflatex" && \
        exit 1; \
    fi

# Ensure TeX Live binaries are in PATH
# Include paths for both 2024 and 2025 years and both x86_64 and aarch64 architectures
ENV PATH="/usr/local/bin:/usr/local/texlive/2025/bin/x86_64-linux:/usr/local/texlive/2025/bin/aarch64-linux:/usr/local/texlive/2024/bin/x86_64-linux:/usr/local/texlive/2024/bin/aarch64-linux:${PATH}"

# Copy function code
COPY app.py ${LAMBDA_TASK_ROOT}/
COPY config.py ${LAMBDA_TASK_ROOT}/

# Install Python dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Final verification - MUST succeed or build fails
# This ensures pdflatex is accessible via the symlink at /usr/local/bin/pdflatex
RUN echo "=== Final pdflatex verification ===" && \
    echo "Checking /usr/local/bin/pdflatex symlink..." && \
    if [ -L /usr/local/bin/pdflatex ] && [ -x /usr/local/bin/pdflatex ]; then \
        echo "Symlink exists and is executable" && \
        ls -la /usr/local/bin/pdflatex && \
        echo "Running pdflatex --version..." && \
        /usr/local/bin/pdflatex --version && \
        echo "=== pdflatex verification PASSED ===" && \
        echo "pdflatex is ready for use at /usr/local/bin/pdflatex"; \
    else \
        echo "=== pdflatex verification FAILED ===" && \
        echo "Symlink status:" && \
        ls -la /usr/local/bin/pdflatex 2>/dev/null || echo "Symlink does not exist" && \
        echo "PATH contents:" && \
        echo $PATH && \
        echo "Searching for pdflatex..." && \
        find /usr/local -name "pdflatex" -type f 2>/dev/null && \
        echo "TeX Live directory contents:" && \
        ls -la /usr/local/texlive/2024/bin/ 2>/dev/null || echo "No bin directory" && \
        echo "Build FAILED - pdflatex must be accessible" && \
        exit 1; \
    fi

# Set the CMD to your handler
CMD [ "app.handler" ]

