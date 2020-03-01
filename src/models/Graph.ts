
export class Graph {
  /**
   * { <city>: [[destination, distance]] }
   */
    private adjList: {[key: string]: any[][]};
    private vertices: Set<string>

    constructor() {
      this.adjList = {};
      this.vertices = new Set();
    }

    public getAdjList() {
        return this.adjList;
    }

    public getVertices() {
      return this.vertices;
    }
  
    /**
     * Create adjacency list, { <src>: [[dest, distance]] }
     * @param data 
     */
    createGraph(data: string []) {
      for (const item of data) {
        const [src, dest, distance] = item.split("");
        if (!this.adjList[src]) {
          this.adjList[src] = [[dest, parseInt(distance)]];
        } else {
          this.adjList[src].push([dest, parseInt(distance)]);
        }
        if (!this.vertices.has(src)) {
          this.vertices.add(src);
        }
        if (!this.vertices.has(dest)) {
          this.vertices.add(dest);
        }
      }
    }
  }