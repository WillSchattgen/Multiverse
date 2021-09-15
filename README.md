# Multiverse

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Helpful stuff I have found

Run `ng serve --host=0.0.0.0 --disable-host-check` to allow access to other computers.

10.0.0.15



## Database commands

Connect: (localDB)\Multiverse

Microsoft Windows [Version 10.0.19043.1165]
(c) Microsoft Corporation. All rights reserved.

C:\Users\Will>sqllocaldb info
MSSQLLocalDB

C:\Users\Will>sqllocaldb -v
Unknown SqlLocalDB operation: "-v".
Use the "-?" command-line option to see the available operations.

C:\Users\Will>MSSQLLocalDB -v
'MSSQLLocalDB' is not recognized as an internal or external command,
operable program or batch file.

C:\Users\Will>SqlLocalDB create "Multiverse"
LocalDB instance "Multiverse" created with version 13.1.4001.0.

C:\Users\Will>SqlLocalDB start "Multiverse"
LocalDB instance "Multiverse" started.

C:\Users\Will>SqlLocalDB info "Multiverse"
Name:               Multiverse
Version:            13.1.4001.0
Shared name:
Owner:              DESKTOP-I04HJDR\Will
Auto-create:        No
State:              Running
Last start time:    8/17/2021 7:25:20 PM
Instance pipe name: np:\\.\pipe\LOCALDB#442CBF82\tsql\query

C:\Users\Will>