# Playwright + ScreenPlay pattern automation framework

Project health check (weekly execution):

[![Tests status](https://github.com/matspina/screen-play-wright/actions/workflows/run-tests-prod.yml/badge.svg)](https://github.com/matspina/screen-play-wright/actions/workflows/run-tests-prod.yml)

## Table of Contents

1. [Screenplay Design Pattern](#screenplay-design-pattern)
1. [Screenplay steps](#screenplay-steps)
1. [Setting up](#setting-up)
    1. [Requirements](#requirements)
    1. [Installation](#installation)
    1. [Configuration](#configuration)
        1. [Project configuration files](#project-configuration-files)
        1. [GIT LFS](#git-lfs)
        1. [Windows users only](#windows-users-only)
1. [Usage](#usage)
    1. [Project structure](#project-structure)
    1. [Running tests](#running-tests)
        1. [Available environments](#available-environments)
        1. [Running with parameters in command line](#running-with-parameters-in-command-line)
        1. [Running with Docker](#running-with-docker)
        1. [Report](#report)
    1. [Writing new tests](#writing-new-tests)
    1. [Static code verification](#static-code-verification)
1. [Troubleshooting and Tips](#troubleshooting-and-tips)

---

## Screenplay Design Pattern

This project follows the screenplay design pattern, which is a concept to organize and write more readable and maintainable tests.
More info about the pattern [in this article](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay/).

There are classes for Actors, Abilities, Interactions, Tasks and Questions, which are instantiated statically.

- Actors represent the users of the system.
- Abilities represent what the Actors can do.
- Interactions are wrappers around Playwright methods to manipulate the browser.
- Tasks fulfill user flows or group repeatable actions.
- Questions verify the system state.

Example of an interaction step:
`await user.attemptsTo(Navigate.to(SamplePageTest.URL))`

Example of a question step:
`await user.asks(IsPageUrl.matching(/.*qa\.sample\.com\/some-test-page/))`

## Screenplay steps

- New interaction steps should be develop under `./src/screenplay/interactions`
    - To list all available interactions in the terminal, run: `npm run list:interactions [FILTER]?` - e.g.: `npm run list:interactions` or `npm run list:interactions click`
- New question steps should be develop under `./src/screenplay/questions`
    - To list all available questions in the terminal, run: `npm run list:questions [FILTER]?` - e.g.: `npm run list:questions` or `npm run list:questions type`

## Setting up

### Requirements

- [Node.js 20+](https://nodejs.org) (**Recommended: install it with [nvm](https://github.com/nvm-sh/nvm)**)
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

#### Project configuration files

1. Playwright configuration is located at `./src/config/playwright.config.ts`.
    - If needed, open the file and customize the Playwright configs (such as default timeouts, profiles, etc) according to your needs.
1. Project global setup is located at `./src/config/global-setup.ts`.
    - By default, the global setup runs all **sites global setup** steps (explained below) before the tests.
    - If you need to include any other additional setup script prior to the sites global setup, open the global setup file and customize it.
1. Project global teardown is located at `./src/config/global-teardown.ts`.
    - By default, the global teardown **does not** run any script.
    - If you need to include any teardown script, open the global teardown file and customize it.
1. Environments configuration is located at `./src/config/environments-map.ts`.
    - Customize the environments-map file with your sites URLs per environment.
    - The available environments are: `dev`, `qa`, `uat` and `prod`.

#### GIT LFS

Git Large File Storage (LFS) replaces large files such as audio samples, videos, datasets, and graphics with text pointers inside Git, while storing the file contents on a remote server like GitHub.com or GitHub Enterprise.

This is required for this project once it's essential for versioning image files (like the ones we use to keep the snapshot baselines, for visual regression), so the repository doesn't keep bynary files inside it, avoiding taking up more space than it really needs.

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

- Tests (.spec) files are under the `./tests` folder.
    - Here is where tests written with the screenplay pattern are located.
- Page object files are under the `./src/page-objects` folder, and they serve as storage to keep constants (such URLs and selectors) for each page.
    - It's a good practice to have one page object file per page, per site.
- Sites global setup files should be placed under the `./src/config` folder with the extension `.setup.ts`
    - These files run pre-defined steps (such as login steps) before the tests which are related to it, and then it saves the browser session state in a temporary json file, to be used by the tests afterwards.
- You can build your customized tasks (group of steps) if needed, under the `./src/screenplay/tasks` folder

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

#### Running with parameters in command line

To run **all** the tests on UAT environment for example, simply execute:

```shell
npm test --env=uat
```
(when passing the environment in command line, the menu is skipped)

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
npm test tests/proj1/e2e
```

Or simply:

```shell
npm test e2e
```

Or using regex:

```shell
npm test proj1/.*/components
```

Multiple paths/regex are also valid, for example:

```shell
npm test e2e components
```
(Will run tests of paths containing the words "e2e" and "components")

#### Running with Docker

Docker is useful to run the tests more consistently across all OS/Platforms, and it is required for visual regression tests.

Make sure you have already built the Docker image once with:

```shell
npm run docker:build
```

To run the tests inside the docker container, run:

```shell
npm run test:docker
```

All the parameters described above are available in the same way.

Note: Baseline snapshots for visual regression must be taken and saved using the docker container, once it will be more consistent when running the tests across all OS/Platforms. Baseline images created outside the docker container won't be tracked by Git.

#### Report

After the test run, an HTML report is created in the folder ./playwright-report

You can open it by running:

```shell
npm run report
```

### Writing new tests

- Create a new test spec file under the `./tests/` folder and write the steps using the screenplay design pattern:
    - To list all available interactions in the terminal, run: `npm run list:interactions [FILTER]?` - e.g.: `npm run list:interactions` or `npm run list:interactions click`
    - To list all available questions in the terminal, run: `npm run list:questions [FILTER]?` - e.g.: `npm run list:questions` or `npm run list:questions type`
- To specify a profile for your test, there are 2 options: you can add a TAG in test name to run as `[MOBILE-ONLY]` or `[DESKTOP-ONLY]`, OR you can include the profile name (`mobile` or `desktop`) in the test file name before the `spec` word.
    - For example, the file `feature.mobile.spec.ts` will run only on the mobile profile, while the file `feature.desktop.spec.ts` will run only on the desktop profile.
    - If no profile name is specified (e.g. `feature.spec.ts`), the tests will run on both profiles, except for the tests including a profile TAG as described above.
    - By default, mobile profile uses **Safari browser** simulating an iPhone device, while the desktop profile uses **Chromium browser** (configuration available in `./src/config/playwright.config.ts` file)
- Run the tests to verify they are passing as expected

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
