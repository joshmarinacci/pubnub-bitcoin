(function(){

// DISPLAY UI ELEMENTS
var btc_current = updater('btc-current', false )
,   btc_high    = updater('btc-high',    true  )
,   btc_low     = updater('btc-low',     true  );

// MTGOX TICKER DISPLAY UPDATES
PUBNUB.events.bind( 'ticker.BTCUSD', function(data) {
    // SET LAST ARROW CHANGE UP/DOWN
    var up   = 'glyphicon glyphicon-chevron-up icon-green'
    ,   down = 'glyphicon glyphicon-chevron-down icon-red';

    PUBNUB.$('btc-current-arrow').className = 
        +data.ticker.last.value > btc_current.last ? up : down;

    // SET CURRENT LOW AND HIGH VALUES
    btc_current(data.ticker.last);
    btc_high(   data.ticker.high);
    btc_low(    data.ticker.low);
} );

// MTGOX TRADES (BUY/SELL)
PUBNUB.events.bind( 'ticker.BTCUSD', function(data) {
    //console.log(data);
} );

// UPDATE UI USER INTERFACE VALUES
function updater( name, noanimate ) {
    var node = PUBNUB.$(name);

    function fn(msg) {
        var display = msg.display_short
        ,   value   = +msg.value
        ,   up      = {
            d          : 1,
            ty         : -10,
            background : 'rgba( 92, 184, 92, 0.8 )',
            color      : '#fff' }
        ,   down    = {
            d          : 1,
            ty         : 10,
            background : 'rgba( 217, 83, 79, 0.8 )',
            color      : '#fff' };

        node.innerHTML = display;
        (fn.last != value) && !noanimate && animate( node, [
            (fn.last < value) ? up : down,
            { d          : 1,
              ty         : 0,
              background : 'transparent',
              color      : '#f90' }
        ] );
        fn.last = value;
    };

    fn.last = 0;
    fn.node = node;
    return fn;
}

})();
