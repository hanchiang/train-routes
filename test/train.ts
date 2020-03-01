import { expect } from "chai";
import sinon from "sinon";

import { Train, NumberOfPathType, Graph } from "../src/models";

describe("Train tests", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("readInput()", () => {
        it("invalid file path", async () => {
            const filepath = "input/invalid.txt";
            let error;
            try {
                await new Train().readInput(filepath);
            } catch(e) {
                error = e;
            } finally {
                expect(error).to.not.equal(undefined);
            }
        });
        it("returns array of string without spaces", async () => {
            const filepath = "input/test.txt";
            const data: string [] = await new Train().readInput(filepath);
            expect(data.length).to.greaterThan(0);
            for (const item of data) {
                expect(item.length).to.equal(3);
                expect(item.indexOf(" ")).to.equal(-1);
            }
        });
    });

    describe("validateInput()", () => {
        const validateAndExpectError = (data: string []) => {
            let error;
            try {
                new Train().validateInput(data);
            } catch(e) {
                error = e;
            } finally {
                expect(error).to.not.equal(undefined);
            }
        };
        
        it("data is not in the required format: <source><destination><distance>", () => {
            let data = ["AB3", "B3"];
            validateAndExpectError(data);
            
            data = ["AB3", "AB"];
            validateAndExpectError(data);

            data = ["AB3", "3"];
            validateAndExpectError(data);

            data = ["AB3", ""];
            validateAndExpectError(data);
        });

        it("distance is not an integer", () => {
            let data = ["AB3", "ABC"];
            validateAndExpectError(data);

            data = ["AB3", "AB!"];
            validateAndExpectError(data);
        });
    });

    describe("findRouteDistance()", () => {
        let train = new Train();
        const filepath = "input/test.txt";
        const NO_SUCH_ROUTE = "NO_SUCH_ROUTE";

        beforeEach(async () => {
            train = new Train();
            const data = await train.readInput(filepath);
            train.getGraph().createGraph(data);
        });

        it("no such route", () => {
            expect(train.findRouteDistance("AED")).to.equal(NO_SUCH_ROUTE);
        });

        it("have such route", () => {
            expect(train.findRouteDistance("ABC")).to.equal(9);
            expect(train.findRouteDistance("AD")).to.equal(5);
            expect(train.findRouteDistance("ADC")).to.equal(13);
            expect(train.findRouteDistance("AEBCD")).to.equal(22);
            expect(train.findRouteDistance("AED")).to.equal(NO_SUCH_ROUTE);
        });
    });

    describe("findNumberOfRoutes()", () => {
        let train = new Train();
        const filepath = "input/test.txt";

        beforeEach(async () => {
            train = new Train();
            const data = await train.readInput(filepath);
            train.getGraph().createGraph(data);
        });

        it("_getNextCurr() should return correct result", () => {
            const curr = 1;
            const distance = 10;
            expect(train._getNextCurr(curr, NumberOfPathType.stops, distance)).to.equal(2);
            expect(train._getNextCurr(curr, NumberOfPathType.distance, distance)).to.equal(11);
        });

        it("should return correct answer", () => {
            expect(train.findNumberOfRoutes("C", "C", 3, NumberOfPathType.stops)).to.equal(2);
            expect(train.findNumberOfRoutes("A", "C", 4, NumberOfPathType.stops, true)).to.equal(3);
            expect(train.findNumberOfRoutes("C", "C", 30, NumberOfPathType.distance)).to.equal(7);
        });
    });

    describe("findShortestPathLength()", () => {
        let train = new Train();
        const filepath = "input/test.txt";

        beforeEach(async () => {
            train = new Train();
            const data = await train.readInput(filepath);
            train.getGraph().createGraph(data);
        });

        it("should return shortest path length", () => {
            expect(train.findShortestPathLength("A", "C")).to.equal(9);
            expect(train.findShortestPathLength("B", "B")).to.equal(9);
        });
    });
});