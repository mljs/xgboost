async function exec() {
    let XGBoost = await require('./wasm');
    var a = new XGBoost({
        'booster': 'gbtree',
        'objective': 'reg:linear'
    });
    a.free();
    return "end of execution!";
}

exec().then((result) => {
    console.log(result);
});