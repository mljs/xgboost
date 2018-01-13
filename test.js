async function exec() {

    let XGBoost = await require('./wasm');
    var {
        data,
        labels
    } = generateData();


    var trainer = new XGBoost();
    trainer.train(data, labels);
    console.log("train end");
    console.log(labels);
    console.log(trainer.predict(data));
    trainer.free();
    return "end of execution!";
}

exec().then((result) => {
    console.log(result);
});

const ROWS = 3;
const COLS = 5;

function generateData () {
    var data = new Array(ROWS);
    for (var i = 0; i < ROWS; i++) {
        data[i] = new Array(COLS);
        for (var j = 0; j < COLS; j++) {
            data[i][j] = (i + 1) * (j + 1);
        }
    }

    var labels = new Array(ROWS);
    for (i = 0; i < ROWS; i++) {
        labels[i] = 1 + i*i*i;
    }

    return {
        data: data,
        labels: labels
    };
}