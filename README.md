
# Input file
Input files are placed under `input/` directory

# How to use
* Install [node.js](https://nodejs.org/en/download/)
* Install dependencies: `npm install`
* Build the project: `npm run build`
* Run tests: `npm run test`
* Run the program with input file: `node dist/index.js <path/to/file>`

# Design of solution

## Graph class
`Graph` class is used store the input data.
Data structures:
* Adjacency list to retrieve neighbours of a vertex
* Set to iterate through all vertices

## Train class
`Train` class contains an instance of graph, and is used to compute the results of the various operations

## Shortest path
Dijkstra's algorithm is used to find the shortest path from a source vertex to all other vertices

# Assumptions
* Distance is a positive integer