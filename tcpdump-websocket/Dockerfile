FROM alpine

RUN apk add curl tcpdump && \
    curl -Lo /tmp/websocketd.zip https://github.com/joewalnes/websocketd/releases/download/v0.4.1/websocketd-0.4.1-linux_arm64.zip && \
    unzip /tmp/websocketd.zip && \
    chmod +x websocketd && \
    mv websocketd /usr/local/bin/ && \
    rm /tmp/websocketd.zip

EXPOSE 8080
COPY start-tcpdump.sh /
CMD ["websocketd", "--devconsole", "--port=8080", "/start-tcpdump.sh"]
