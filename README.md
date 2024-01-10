# Playwright + ScreenPlay pattern Automation Framework

The suite can run locally on Unix based systems, like Linux or macOS, and Windows.

1. Minimum knowledge needed to create new tests:
    - Javascript
    - CSS selectors or [Playwright selectors](https://playwright.dev/docs/selectors) (extension of CSS selectors - **Recommended**)
1. Average knowledge needed to create new core methods:
    - Object oriented javascript
    - Typescript
    - [Playwright API](https://playwright.dev/docs/api/class-playwright)

## Table of Contents

1. [Screenplay Design Pattern](#screenplay-design-pattern)
1. [Setting up](#setting-up)
    1. [Requirements](#requirements)
    1. [Installation](#installation)
    1. [Configuration](#configuration)
        1. [Project configuration files for reference](#project-configuration-files-for-reference)
        1. [GIT LFS](#git-lfs)
        1. [Windows users only](#windows-users-only)
1. [Usage](#usage)
    1. [Project structure](#project-structure)
    1. [Running tests](#running-tests)
        1. [Available environments](#available-environments)
        1. [Running locally with parameters in command line](#running-locally-with-parameters-in-command-line)
        1. [Running with Docker](#running-with-docker)
        1. [Report](#report)
    1. [Recommended steps to write new tests](#recommended-steps-to-write-new-tests)
    1. [Static code verification](#static-code-verification)
1. [Troubleshooting and Tips](#troubleshooting-and-tips)

---

## Screenplay Design Pattern

This project follows the screenplay design pattern, which is a concept to organize and write more readable and maintainable tests.
More info about the pattern [here](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay/).

There are classes for Actors, Abilities, Interactions, Tasks and Questions, which are instantiated statically.

- Actors represent the users of the system.
- Abilities represent what the Actors can do.
- Interactions are wrappers around Playwright methods to manipulate the browser.
- Tasks fulfill user flows or group repeatable actions.
- Questions verify the system state.

## Setting up

### Requirements

- [Node.js 16+](https://nodejs.org) (**Recommended: install it with [nvm](https://github.com/nvm-sh/nvm)**)
- [Docker](https://www.docker.com) (Required for visual regression testing)
- [Git LFS](https://git-lfs.github.com)
- VScode Extensions highly recommended:
    - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

### Installation

Install all the required software listed above.

Install Node.js modules configured on package.json with:

```shell
npm install
```

To use a Docker container to run the tests, build the image once with:

```shell
npm run docker:build
```

### Configuration

#### Project configuration files for reference

1. Playwright configuration is on `./src/config/playwright.config.js`.
1. Playwright global setup is on `./src/core/global-setup.js`.
1. Environments configuration is on `./src/config/<experience>/environments-map.js`.

#### GIT LFS

Git Large File Storage (LFS) replaces large files such as audio samples, videos, datasets, and graphics with text pointers inside Git, while storing the file contents on a remote server like GitHub.com or GitHub Enterprise.

This is required for this project. It is useful for versioning image files (like the ones we use to keep the snapshot baselines, for visual regression), so the repository doesn't keep bynary files inside it, avoiding taking up more space than it really needs.

1. [Download](https://git-lfs.github.com/) and install it.
1. Then, run `git lfs install` once to set up Git LFS for your user account and it's done! No configuration is needed. The file /.gitattributes is already set to take care of it.

#### Windows users only

On Windows OS, by default, the Powershell is set to restrict any script execution. To run the tests locally, we need to set the execution policy in Powershell to accept at least remoteSigned scripts for your current user.

To do so, open your Powershell and run the following:

```shell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope currentUser
```

## Usage

### Project structure

Page object files are under the `./src/page-objects` folder, and they serve as storage to keep constants for each test.

Tests (.spec) files are under the `./tests` folder.

### Running tests

Simply run:

```shell
npm test
```
Required and some optional parameters will be asked via menu.

#### Available environments

- dev
- qa
- uat
- prod

Note 1: It is not required to have all those environments configured for each experience. Those are all the possible environments to use within the tests.

Note 2: some experiences may have more than one instance for the same environment. In these cases, it is possible to provide the instance number as well, e.g.: `--env=qa3`. If no instance number is specified, the first one will be considered for each experience. If the specified number does not exist for some given experience, the first instance will be considered for this experience.

#### Running locally with parameters in command line

To run **all** the tests on UAT environment for example, simply execute:

```shell
npm test --env=uat
```
(when passing the environment in command line, the menu is not skipped)

Or, to run all tests within a single experience (e.g.: nagbrands), execute:

```shell
npm test nagbrands
```

Valid arguments for running the tests:

```text
--env=[ENV] - Environment to run tests against. E.g.: --env=qa3

--debug - Shows information about network activity

--headless - Runs in headless mode [DEFAULT: If not provided, opens the browser locally] E.g.: --headless (does not open the browser)

--profile=[mobile|desktop] - Profile to run the tests [DEFAULT: runs on both] E.g.: --profile=desktop (runs desktop only)

--retries=[NUMBER] - Number of retries [DEFAULT: 0] E.g.: --retries=1

--slow-network - Simulates a slow network, useful to check tests reliability. NOTE: Only works in Chromium and requires browserContext

--skip-state - Skips the Save State Global Setup step [DEFAULT: If not provided, it saves a new state] E.g.: --skip-state (does not save a new state)

--update-snapshots - Creates/Updates the visual regression snapshots, when different from current or non-existent

--workers=[NUMBER] - Number of workers to run in parallel [DEFAULT: 1] E.g.: --workers=5
```

You can also pass a path (or part of it, as a regex) to run a specific folder or test if you want, like below:

```shell
npm test tests/nagbrands/functionalities
```

Or simply:

```shell
npm test widget-container
```

Or using regex:

```shell
npm test nagbrands/.*/components
```

Multiple paths/regex are also valid, for example:

```shell
npm test widget-container card text-with-image
```
(Will run tests of paths containing the words "widget-container", "card" and "text-with-image")

#### Running with Docker

Docker is useful to run the tests more consistently across all OS/Platforms, and it is required for visual regression tests.

Make sure you have already built the Docker image once with:

```shell
npm run docker:build
```

Then start and enter the container with:

```shell
npm run docker:run
```

Once you are inside the container, you can run the tests with the same commands as described above, such as `npm test` or including any parameter as needed.

Note: Baseline snapshots for visual regression must be taken and saved using the docker container, once it will be more consistent when running the tests across all OS/Platforms. Baseline images created outside the docker container won't be tracked by Git.

#### Report

After the test run, an HTML report is created in the folder ./playwright-report

You can open it by running:

```shell
npm run report
```

### Recommended steps to write new tests

1. Create a new branch from the main branch;
1. Write and verify the tests;
    - You can find all available interactions under `./src/screenplay/interactions` and questions (asserts) under `./src/screenplay/questions`
    - To list all available interactions in the terminal, run: `npm run list:interactions [FILTER]?` - e.g.: `npm run list:interactions` or `npm run list:interactions click`
    - To list all available questions in the terminal, run: `npm run list:questions [FILTER]?` - e.g.: `npm run list:questions` or `npm run list:questions type`
    - To specify a profile for your test, there are 2 options: you can add a TAG in test name to run as `[MOBILE-ONLY]` or `[DESKTOP-ONLY]`, OR you can include the profile name (`mobile` or `desktop`) in the test file name before the `spec` word.
        - For example, the file `test.mobile.spec.ts` will run only on the mobile profile, while the file `test.desktop.spec.ts` will run only on the desktop profile.
        - If no profile name is specified (e.g. `test.spec.ts`), the tests will run on both profiles, except for the tests including a profile TAG as described above.
        - By default, mobile profile uses **Safari browser** simulating an iPhone device, while the desktop profile uses **Chromium browser** (configuration available in `./src/config/playwright.config.ts` file)
1. Add and commit the desired files and then push them with `git` following your team's SCM.

Tip: Use screenplay code snippets to speed up your tests writting! For example: in the spec files, start typing `ask` and a snippet will appear to complete the step (`await user.asks()`). Check out all code snippets at `./.vscode/screenplay.code-snippets`

### Static code verification

Run lint (combo of eslint, markdown lint and typescript checker):

```shell
npm run lint
```

...or to auto fix issues:

```shell
npm run lint:fix
```

Tip: If using VScode with recommended extensions as described above, the auto fixable issues are fixed automatically on file save action.

---

## Troubleshooting and Tips

- [TROUBLESHOOTING] Host system is missing dependencies to run browsers
    - Sometimes when installing and running the suite in linux SO for the first time this error can happen.
    - To solve it, try running in the terminal `sudo npx playwright install-deps`.
    - It should install all missing dependencies. If it does not work, probably you wil need to install the browser dependencies manually (e.g.: apt-get install dependency-name)

- [TIP] How to simulate device camera with a custom/fake video or image:
    1. To simulate the video capture, we must convert any image or video file to the .Y4M format. To do so, download the software `ffmpeg` and run the following command in your terminal, adding the input and output files paths accordingly:
        - `ffmpeg -y -i INPUT.MP4 -pix_fmt yuv420p OUTPUT.Y4M`
        - Note: INPUT.MP4 is the path/file-name of the image/video that will be converted. OUTPUT.Y4M is the path/file-name of the final file which will be created. Prefer using short video files, because the .Y4M format takes too much disk space.
    1. In your mobile.spec.ts test file, add the following snippet in the beginning of the test file after all imports, just changing the [FILE_PATH] accordingly:
    ```js
    test.use({
        ...devices['Pixel 5'], // Can be any device available in Playwright library which uses chromium browser
        launchOptions: {
            args: [
                '--use-fake-device-for-media-stream',
                '--use-fake-ui-for-media-stream',
                '--use-file-for-fake-video-capture=[FILE_PATH].Y4M' // Path is relative, e.g.: ./tests/ex/test-data/file.Y4M
            ]
        }
    })
    ```
    1. Then, when the test requires the device camera, the chosen .Y4M video will be played.
