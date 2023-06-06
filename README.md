# NestJS-Test-Generator

An initail unit test file generator based on NestJS, jest.

It finds main test targets, mock targets, and dependency injection targets in the file and converts them to the test file format.

# What it does..

- finds main test target Class
- detects its dependency injections
- detects methods that main Class and dependencies using in file.
- detects all external import libraries used in a file.
- convert them into testing file.
  - dependencies are converted to mock provider/repository.
  - all external libraries are converted to mock library.
  - the test target is not mocked.
  - make todos of all test target's methods.

# Usage

### Installation

### Basic Usage
