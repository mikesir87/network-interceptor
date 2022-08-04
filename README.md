# Test Runner

This project provides a GUI to support the running of tests located on the filesystem. The idea is to use a generic runner, but mount in tests based on the use case (per tutorial, writeup, etc.).

## Starting the Runner

If you want to run the app, you can use the following command after cloning the repo. This is going to mount in the sample tests, but feel free to swap out with your own tests!

```
docker run -dp 3000:3000 -v $PWD/sample-tests:/tests mikesir87/test-runner
```

Then, open [http://localhost:3000](http://localhost:3000).


## Writing your own Tests

When the app starts, it scans for all test suites in the `/tests` directory. The directory structure is as follows:

- Each suite of tests is in its own folder, allowing you to run one suite at a time
- Each directory _must_ have a `suite.yaml` that defines metadata about the suite
- All tests are in `*.spec.js` files and will be included as part of the suite execution

In a pseudo-graphical view, it'll look like this: 

```
- /tests/
    - suite-one/
        - suite.yaml
        - test.spec.js
    - suite-two/
        - suite.yaml
        - test.spec.js
        - test2.spec.js
```

### Test Runners

Currently, only [Jest](https://jestjs.io) tests are supported. Soon, Cypress tests will be supported as well.


### `suite.yaml` Definition

The `suite.yaml` file must provide the following information:

```yaml
title: Short Title
description: A longer description for the suite
runner: jest
```

Eventually, additional runners (like Cypress) will be supported, so more config options will eventually be added.


## Development

To spin up development, simply run `docker compose up` and open [http://localhost:3000](http://localhost:3000). 

The Node backend is available in `./backend` and through endpoints at `http://localhost:3000/api`. The React client is available in `./client` and through all other endpoints.

To simplify testing, a set of tests are available in `sample-tests` and mounted into the backend. Feel free modify them to experience test failures, etc.

