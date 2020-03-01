import { expect } from "chai";

import { Graph } from "../src/models";

describe("Graph tests", () => {
    describe("createGraph()", () => {
        it("should create adjacency list", () => {
            const data = ["AB3", "AD4", "CD2"];
            const graph = new Graph();
            graph.createGraph(data);

            const adjList = graph.getAdjList();
            expect(adjList["A"].length).to.equal(2);
            expect(adjList["A"][0][0]).to.equal("B");
            expect(adjList["A"][0][1]).to.equal(3);

            expect(adjList["A"][1][0]).to.equal("D");
            expect(adjList["A"][1][1]).to.equal(4);

            expect(adjList["C"].length).to.equal(1);
            expect(adjList["C"][0][0]).to.equal("D");
            expect(adjList["C"][0][1]).to.equal(2);

            const vertices = graph.getVertices();
            expect(vertices.size).to.equal(4);
            expect(vertices.has("A")).to.equal(true);
            expect(vertices.has("B")).to.equal(true);
            expect(vertices.has("C")).to.equal(true);
            expect(vertices.has("D")).to.equal(true);
        });
    });
});