# Container Network Tool

This project provides a minimal web-based network visualizer that lets you intercept (using `tcpdump`) the traffic of any container running on your machine. And best of all... no tools are required to be installed in the container!

## How it works

To intercept traffic, we're leveraging `tcpdump`. Recognizing most containers don't have `tcpdump` installed, we are leveraging the `nicolaka/netshoot` image to start a new container in the same process and network namespace as the target container. This lets us listen to the same network interfaces the container is using without requiring tools to be installed in the container itself.

Once the packets are intercepted, they are transmitted via WebSocket to the frontend application where they are decoded and rendered in the UI. The "backend" of the app simply serves as the relay to start the interceptor and forward the intercepted packets.

## Running the application

Simply run:

```
docker run -dp 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock mikesir87/network-interceptor
```

After the container starts, open http://localhost:3000 to see the application.

## Development

To run the application in development, use Docker Compose!

```
docker compose up -d
```

Then, open [http://localhost:3000](http://localhost:3000). Changes you make to either the froned or backend will be seen immediately.
