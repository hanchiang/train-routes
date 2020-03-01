import fs from "fs";
import { promisify } from "util";
const readfile = promisify(fs.readFile).bind(fs);

import { Graph } from "./Graph";

// Find number of path by number of stops or total distance
export enum NumberOfPathType {
  stops = "stops",
  distance = "distance"
}

export class Train {
    private graph: Graph;
  
    constructor() {
      this.graph = new Graph();
    }

    public getGraph() {
        return this.graph;
    }
  
    /**
     * each string should be 3 characters, in the format <src><dest><distance>
     * @param data 
     */
    validateInput(data: string []) {
      for (const item of data) {
        if (item.length !== 3) {
          throw new Error("Data should be in the format <source><destination><distance>");
        }
        if (isNaN(parseInt(item.charAt(2)))) {
          throw new Error("distance should be an integer");
        }
      }
    }
  
    /** 
     * @param filepath
     * @return string []
     */
    async readInput(filepath: string) {
      try {
        const data = await readfile(filepath, { encoding: "utf-8" });
        const cleaned = data.split(",").map((line: string) => line.trim());
        return cleaned;
      } catch(e) {
        throw e;
      }
    }

    /**
     * Helper for to set the next `curr` in `_findNumberOfRoutes()`
     * @param curr 
     * @param type 
     * @param dist 
     */
    _getNextCurr(curr: number, type: NumberOfPathType, dist: number) {
      if (type === NumberOfPathType.stops) {
        return curr + 1;
      } else if (type === NumberOfPathType.distance) {
        return curr + dist;
      }
    }

    _findNumberOfRoutes(start: string, end: string, max: number, curr: number, type: NumberOfPathType, requireExact: boolean = false, path: string): number {
      let total = 0;
      const adjList = this.graph.getAdjList();
      const neighbours = adjList[start];

      // base case: exceed max condition
      if (curr > max) {
        return 0;
      }

      if (start === end && path.length !== 1) {
        // base case with exact condition
        if (requireExact && curr === max) {
          return 1;
        }
        // base case with maximum condition, continue recursing through neighbours
        if (!requireExact && curr <= max) {
          let innerTotal = 1;
          for (const [innerNeighbour, innerDist] of adjList[start]) {
            innerTotal += this._findNumberOfRoutes(innerNeighbour, end, max, this._getNextCurr(curr, type, innerDist), type, requireExact, path + innerNeighbour);
          }
          return innerTotal;
        }
      }
      for (const [neighbour, dist] of neighbours) {
        total += this._findNumberOfRoutes(neighbour, end, max, this._getNextCurr(curr, type, dist), type, requireExact, path + neighbour);
      }
      return total;
    }

    findNumberOfRoutes(start: string, end: string, max: number, type: NumberOfPathType, requireExact: boolean = false) {
      return this._findNumberOfRoutes(start, end, type === NumberOfPathType.distance ? max - 1 : max, 0, type, requireExact, start);
    }

    /**
     * Find minimum of distance(city to X) and edge of (X to city)
     * For each vertex that is not `city`:
     *   For each neighbour of vertex's neighbours:
     *     find the minimum distance from city to vertex and neighbour to city
     * @param distance 
     * @param vertices a set
     * @param start starting city
     * @param end ending city
     */

    _findShortestCycleLength(distance: {[key: string]: number}, adjList: {[key: string]: any[][]}, vertices: Set<string>, city: string): number {
      let minDistance = Infinity;

      for (const [vertex,] of vertices.entries()) {
        if (vertex !== city) {
          for (const [neighbour, dist] of adjList[vertex]) {
            if (neighbour === city && (distance[vertex] + dist < minDistance)) {
              minDistance = distance[vertex] + dist;
            } 
          }
        }
      }
      return minDistance;
    }

    /**
     * @param distance 
     * @param visited 
     */
    _findCityWithMinDistance(distance: {[key: string]: number}, visited: {[key: string]: boolean}) {
      let minCity = "";
      let minSoFar = Infinity;
      for (const item of Object.entries(distance)) {
        const [city, dist]: [string, number] = item;
        if (!visited[city] && dist < minSoFar) {
          minSoFar = dist;
          minCity = city;
        }
      }
      return minCity;
    }

    /**
     * Run dijkstra's algorithm to compute the shortest length from `start` city to all cities
     * Set distance of all, but starting vertex, to infinity
     * For each vertex:
     *   Select vertex with minimum distance that has not been visited
     *   Set vertex as visited
     *   For each neighbour:
     *     If there is a shorter path to neighbour, update its distance
     * @param start Starting city
     * @param end ending city
     */
    findShortestPathLength(start: string, end: string) {
      const visited: {[key: string]: boolean} = {};
      const distance: {[key: string]: number} = {};
      const vertices = this.graph.getVertices();
      const adjList = this.graph.getAdjList();

      // set distance of all vertices to infinity
      for (const [vertex,] of vertices.entries()) {
        distance[vertex] = Infinity;
        visited[vertex] = false;
      }
      distance[start] = 0;

      // for each vertex, find the vertex that not not been visited with the minimum distance
      for (let i = 0; i < vertices.size - 1; i++) {
        const minDistCity = this._findCityWithMinDistance(distance, visited);
        visited[minDistCity] = true;
        
        // if there is a shorter path to `minDistCity`'s neighbour, update the distance
        for (const [dest, dist] of adjList[minDistCity]) {
          if (distance[minDistCity] + dist < distance[dest]) {
            distance[dest] = distance[minDistCity] + dist;
          }
        }
      }

      if (start !== end) {
        return distance[end];
      } else {
        return this._findShortestCycleLength(distance, adjList, vertices, start);
      }
    }

    /**
     * @param route e.g. 'ABC'
     * @return distance
     */
    findRouteDistance(route: string) {
        let result: number | string = 0;
        const NO_SUCH_ROUTE = "NO_SUCH_ROUTE";
        const adjList = this.graph.getAdjList();

        for (let i = 0; i < route.length-1; i++) {
            const neighbours = adjList[route.charAt(i)];
            if (!neighbours) {
                continue;
            }

            let foundNextCity = false;
            for (const [neighbour, distance] of neighbours) {
                if (neighbour === route.charAt(i+1)) {
                    foundNextCity = true;
                    result += distance;
                }
            }
            if (!foundNextCity) {
                result = 0;
            }
        }
        return result === 0 ? NO_SUCH_ROUTE : result;
    }
  
    async run() {
      if (process.argv.length !== 3) {
        console.error("Usage: node dist/index.js <path/to/file>");
        process.exit(1);
      }
      try {
        const data: string [] = await this.readInput(process.argv[2]);
        this.validateInput(data);
        this.graph.createGraph(data);

        console.log(`Output #1: ${this.findRouteDistance("ABC")}`);
        console.log(`Output #2: ${this.findRouteDistance("AD")}`);
        console.log(`Output #3: ${this.findRouteDistance("ADC")}`);
        console.log(`Output #4: ${this.findRouteDistance("AEBCD")}`);
        console.log(`Output #5: ${this.findRouteDistance("AED")}`);

        console.log(`Output #6: ${this.findNumberOfRoutes("C", "C", 3, NumberOfPathType.stops)}`);
        console.log(`Output #7: ${this.findNumberOfRoutes("A", "C", 4, NumberOfPathType.stops, true)}`);

        console.log(`output #8: ${this.findShortestPathLength("A", "C")}`);
        console.log(`output #9: ${this.findShortestPathLength("B", "B")}`);

        console.log(`Output #10: ${this.findNumberOfRoutes("C", "C", 30, NumberOfPathType.distance)}`);
      } catch(e) {
        throw e;
      }
    }
  }
  