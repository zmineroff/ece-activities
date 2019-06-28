import { QuestionData, Activity, ParseResponse } from "@calculemus/oli-hammock";
import * as widgets from "@calculemus/oli-widgets";
import * as math from "mathjs";

const nRows = 4;
const nCols = 5;

interface State {
    answer: math.Matrix;
    hint: widgets.HintData;
}

const activity: Activity<State> = {
    init: (): State => ({
        answer: math.matrix().resize([nRows, nCols], 9),
        hint: widgets.emptyHint
    }),
    read: (): State => ({
        answer: math.matrix(readMatrixInterface(nRows, nCols)),
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
            [23/24,  -1/2,    0,   -1/8,  3],
            [  1/2,  -3/4,   1/4,     0,  0],
            [    0,   1/4,  -3/4,   1/2,  0],
            [  1/8,     0,   1/2,  -9/8,  0]
        ]);

        for (let iRow = 0; iRow < nRows; iRow++) {
            let submittedVector = getRowAsVector(state.answer, iRow);
            let correctVector = getRowAsVector(correctMatrix, iRow);
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
    console.log("Vec1: " + vector1);
    console.log("Vec2: " + vector2);

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
