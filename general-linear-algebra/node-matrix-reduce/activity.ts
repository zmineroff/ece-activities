/*
 * ECE General Linear Algebra Problem: node-matrix
 * Student enters equation values for circuit problem into matrix
 * author: Zach Mineroff (zmineroff@cmu.edu)
*/

import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import * as math from "mathjs";

const nRows = 5;
const nCols = 5;

interface State {
    answer: math.Matrix;
    v4resp: number | math.Fraction;
    v3resp: number | math.Fraction;
    v2resp: number | math.Fraction;
    v1resp: number | math.Fraction;
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({
        answer: math.matrix().resize([nRows, nCols], null),
        v4resp: null,
        v3resp: null,
        v2resp: null,
        v1resp: null,
        hint: widgets.emptyHint
    }),
    read: (): State => ({
        answer: math.matrix(readMatrixInterface(nRows, nCols)),
        v4resp: readVoltageInput("#v4_response"),
        v3resp: readVoltageInput("#v3_response"),
        v2resp: readVoltageInput("#v2_response"),
        v1resp: readVoltageInput("#v1_response"),
        hint: widgets.readHint($("#hint"))
    }),
    render: (data: QuestionData<State>): void => {
        // Prompt
        $("#prompt").html(data.prompt!);

        // Matrix inputs
        for (let iRow = 0; iRow < nRows; iRow++) {
            for (let iCol = 0; iCol < nCols; iCol++) {
                let inputId = "#answer_" + iRow + "_" + iCol;
                let value = data.state.answer.get([iRow, iCol]);
                if (value===null) {
                    $(inputId).val('');
                } else {
                    $(inputId).val(math.format(value));
                }
            }
        }

        // Voltage inputs
        renderVoltageInput(data.state.v4resp, "#v4_response");
        renderVoltageInput(data.state.v3resp, "#v3_response");
        renderVoltageInput(data.state.v2resp, "#v2_response");
        renderVoltageInput(data.state.v1resp, "#v1_response");
        
        // Hints
        $("#hint")
            .empty()
            .append(widgets.hint(data.hints!, data.state.hint));

        // Feedback
        $("#feedback")
            .empty()
            .append(widgets.feedback(data.parts[0].feedback));
    },
    parse: (state: State): [ParseResponse] => {
        // Check that a number is entered in all cells
        for (let iRow = 0; iRow < nRows; iRow++) {
            for (let iCol = 0; iCol < nCols; iCol++) {
                let value = state.answer.get([iRow, iCol]);
                if (value === null) {
                    return ["nan"];
                }
            }
        }

        // Check that each row of answer is a scalar multiple of correct matrix
        const correctMatrix = math.matrix([
            [1,  0,   4,  -9,   0],
            [0,  1,  -3,   2,   0],
            [0,  0,  -2,   3,   0],
            [0,  0,   0,  36,  72],
            [0,  0,   0,   0,   0]
        ]);

        for (let iRow = 0; iRow < nRows; iRow++) {
            let submittedVector = getRowAsVector(state.answer, iRow);
            let correctVector = getRowAsVector(correctMatrix, iRow);
            let rowIsCorrect = math.deepEqual(submittedVector, correctVector);

            if (!rowIsCorrect) {
                // Check for multiply by scalar (not reduced)
                let rowIsScalarMultiple = isScalarMultiple(submittedVector, correctVector);
                if (rowIsScalarMultiple) {
                    return ["row" + iRow + "scalarMult"];
                }

                // Check for correct magnitude, but wrong sign
                let correctMagnitude = math.deepEqual(math.abs(submittedVector),
                                                  math.abs(correctVector));
                if (correctMagnitude) {
                    return ["row" + iRow + "wrongSign"];
                }

                // Check for putting equations in wrong order
                let otherRows = math.range(0,iRow);
                otherRows = math.concat(otherRows, math.range(iRow+1, nRows)) as math.Matrix;
                for (let iOther=0; iOther<nRows-1; iOther++) {
                    let otherCorrectVector = getRowAsVector(correctMatrix,iOther);
                    let rowInWrongOrder = math.deepEqual(submittedVector,otherCorrectVector);
                    if (rowInWrongOrder) {
                        return ["wrongOrder"];
                    }
                }

                // Generic row wrong
                return ["row" + iRow + "wrong"];
            }

            let rowIsScalarMultiple = isScalarMultiple(submittedVector, correctVector);
            if (!rowIsScalarMultiple) {
                // Check for correct magnitude, but wrong sign
                let correctMagnitude = isScalarMultiple(math.abs(submittedVector),
                                                        math.abs(correctVector));
                if (correctMagnitude) {
                    return ["row" + iRow + "wrongSign"];
                }

                // Check for putting equations in wrong order
                let otherRows = math.range(0,iRow);
                otherRows = math.concat(otherRows, math.range(iRow+1, nRows)) as math.Matrix;
                for (let iOther=0; iOther<nRows-1; iOther++) {
                    let otherCorrectVector = getRowAsVector(correctMatrix,iOther);
                    let rowInWrongOrder = isScalarMultiple(submittedVector,otherCorrectVector);
                    if (rowInWrongOrder) {
                        return ["wrongOrder"];
                    }
                }

                // Generic row wrong
                return ["row" + iRow + "wrong"];
            }
        }

        // Check voltages
        let v4correct = 2;
        let v3correct = 3;
        let v2correct = 5;
        let v1correct = 6;

        if (state.v4resp==null || state.v4resp!=v4correct) {
            return ["voltage4wrong"];
        }
        if (state.v3resp==null || state.v3resp!=v3correct) {
            return ["voltage3wrong"];
        }
        if (state.v2resp==null || state.v2resp!=v2correct) {
            return ["voltage2wrong"];
        }
        if (state.v1resp==null || state.v1resp!=v1correct) {
            return ["voltage1wrong"];
        }

        return ["correct"];
    }
};

export default activity;


// Takes number string and returns decimal or fraction
function evaluateNumberStr(numberStr: string) {
    let value: number;
    let numIsFraction = numberStr.includes("/");
    if (numIsFraction) {
        try {
            return math.fraction(numberStr);
        }
        catch {
            let fracParts = numberStr.split("/");
            value = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        }
    } else {
        value = parseFloat(numberStr);
    }

    if (isNaN(value)) {
        return null;
    }
    return value;
}

// Reads voltage input from student interface
function readVoltageInput(inputId: string) {
    let rawValue = `${$(inputId).val()}`;
    let value = evaluateNumberStr(rawValue) as number | math.Fraction;
    return value;
}

// Reads matrix inputs from student interface
function readMatrixInterface(nRows: number, nCols: number) {
    var m = math.matrix();
    m.resize([nRows, nCols], undefined);

    for (let iRow = 0; iRow < nRows; iRow++) {
        for (let iCol = 0; iCol < nCols; iCol++) {
            let inputId = "#answer_" + iRow + "_" + iCol;
            let rawValue = `${$(inputId).val()}`;
            let value = evaluateNumberStr(rawValue);

            m.subset(math.index(iRow, iCol), value);
        }
    }

    return m;
}

// Returns true if vector2 is a scalar multiple of vector1, false otherwise
function isScalarMultiple(vector1: math.Matrix, vector2: math.Matrix) {
    // Check that lengths are equal
    const len = math.setSize(vector1);
    if (len !== math.setSize(vector2)) {
        return false;
    }

    const zeroTolerance = 0.0001;
    const valueTolerance = 0.01;

    let bothVecsAll0 = true;
    let scalar = null;
    for (let i = 0; i < len; i++) {
        let val1 = vector1.get([i]);
        let val2 = vector2.get([i]);

        // Handle one or both values being 0
        let val1Is0 = floatsEquivalent(val1, 0, zeroTolerance);
        let val2Is0 = floatsEquivalent(val2, 0, zeroTolerance);
        if (val1Is0 !== val2Is0) {
            // One value is zero, but not the other
            return false;
        }

        if (bothVecsAll0 && (!val1Is0 || !val2Is0)) {
            // At least one value is non-zero
            bothVecsAll0 = false;
        }

        // Calculate the scalar for non-zero values
        if (scalar === null && !val1Is0 && !val2Is0) {
            scalar = val1 / val2;
        }
        let val2ByScalar = val2 * scalar;
        let val1IsScalarMultiple = floatsEquivalent(val2ByScalar, val1, valueTolerance);

        if (!val1IsScalarMultiple) {
            return false;
        }
    }

    if (bothVecsAll0) {
        return true;
    }

    if (scalar === null) {
        // one vector is all zeros, the other isn't
        return false;
    }

    return true;
}

// Returns true if two floats are equivalent, within tolerance
function floatsEquivalent(float1: number, float2: number, tolerance: number) {
    return Math.abs(float1 - float2) < tolerance;
}

// Returns row from matrix as a vector
function getRowAsVector(m: math.Matrix, rowNum: number) {
    let rowMatrix = (math as any).row(m, rowNum); //row not defined in types
    let rowVector = math.flatten(rowMatrix);
    return rowVector as math.Matrix;
}

// Renders a voltage input
function renderVoltageInput(value: number | math.Fraction, inputId: string) {
    if (value==null) {
        $(inputId).val('');
    } else {
        $(inputId).val(math.format(value));
    }
}
