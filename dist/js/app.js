(function(){

// -----------------------------------------------------------------------
// DISPLAY UI ELEMENTS
// -----------------------------------------------------------------------
var btc_current = updater('btc-current', false )
,   btc_high    = updater('btc-high',    true  )
,   btc_low     = updater('btc-low',     true  );

// -----------------------------------------------------------------------
// MTGOX TICKER DISPLAY UPDATES
// -----------------------------------------------------------------------
PUBNUB.events.bind( 'ticker.BTCUSD', function(data) {
    // SET LAST ARROW CHANGE UP/DOWN
    var up    = 'glyphicon glyphicon-chevron-up icon-green'
    ,   down  = 'glyphicon glyphicon-chevron-down icon-red'
    ,   value = +data.ticker.last.value;

    // SET LAST CHANGE ARROW UNDER "CURRENT"
    if (btc_current.last != value)
        PUBNUB.$('btc-current-arrow').className = 
             value > btc_current.last ? up : down;

    // SET CURRENT LOW AND HIGH VALUES
    btc_current(data.ticker.last);
    btc_high(   data.ticker.high);
    btc_low(    data.ticker.low);
} );

// -----------------------------------------------------------------------
// UPDATE UI USER INTERFACE VALUES
// -----------------------------------------------------------------------
function updater( name, noanimate ) {
    var node = PUBNUB.$(name);

    function fn(msg) {
        var display = msg.display_short
        ,   value   = +msg.value
        ,   up      = {
            d          : 1,
            ty         : -6,
            background : 'rgba( 92, 184, 92, 0.8 )',
            color      : '#fff' }
        ,   down    = {
            d          : 1,
            ty         : 4,
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

// -----------------------------------------------------------------------
// MTGOX TRADES (BUY/SELL)
// -----------------------------------------------------------------------
var trade_template = PUBNUB.$('trade-template').innerHTML;
var trade_area     = PUBNUB.$('trade-area');
var timeagos       = []
,   divs           = [];
PUBNUB.events.bind( 'trade.BTC', function(data) {
    var div = PUBNUB.create('div');
    divs.push(div);

    // CALCULATIONS
    data.trade.total = (+data.trade.price) * (+data.trade.amount);
    if (!data.trade.total) console.log(data.trade);
    data.trade.total = numf(data.trade.total);
    data.trade.price = numf(data.trade.price);
    data.trade.tid   = PUBNUB.uuid();
    data.trade.time  = get_time_ago(data.trade.date);

    // RENDER TEMPLATE
    div.innerHTML = PUBNUB.supplant( trade_template, data.trade );
    animate( div, [
        { d : 0.1, ty : -50, opacity : 0.0 },
        { d : 1.0, ty :   0, opacity : 1.0 }
    ] );

    // APPEND NEW TRADE
    trade_area.insertBefore( div, first_div(trade_area) );

    // SNAPSHOT TIME AGO DIV
    var timeago = PUBNUB.$('trade-time-ago-'+data.trade.tid);
    PUBNUB.attr( timeago, 'trade-date', data.trade.date );
    timeagos.push(timeago);

    // REMOVE OLDER TRADES TO PREVENT OVERFLOW
    if (divs.length < 10) return;
    trade_area.removeChild(divs.shift());
    timeagos.shift();

    // UPDATE TIME AGO LISTING RIGHT AWAY
    update_time_ago();
} );

function get_time_ago(then) {
    var now     = (+new Date/1000)
    ,   timeago = +Math.ceil((now - (+then)));
    timeago = (timeago < 0) ? '0' : ''+timeago;
    if (timeago == '1') timeago = '0';
    return timeago;
}

setInterval( update_time_ago, 5000 );
function update_time_ago() {
    PUBNUB.each( timeagos, function(timeago) {
        var then = PUBNUB.attr( timeago, 'trade-date' );
        timeago.innerHTML = get_time_ago(then);
    } );
}

// -----------------------------------------------------------------------
// CHAT ABOUT TRADES AND BITCOIN
// -----------------------------------------------------------------------
var chat_template = PUBNUB.$('chat-template').innerHTML;
var chat_area     = PUBNUB.$('chat-area');


// -----------------------------------------------------------------------
// SET MONTH
// -----------------------------------------------------------------------
var month_names = [ "January", "February", "March", "April", "May",
                    "June", "July", "August", "September", "October",
                    "November", "December" ];
function month() { return month_names[(new Date()).getMonth()] }
PUBNUB.$('current-date').innerHTML = (new Date().getDate())+'-'+month();

// -----------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------
function first_div(elm) { return elm.getElementsByTagName('div')[0]  }
function safe(text)     { return (text||'').replace( /[<>]/g, '' )   }
function numf(num)      { return (+((num*100)+'').split('.')[0])/100 }

})();
