YUI.add('colly', function(Y) {

var YArray      = Y.Array,
    YArray_each = YArray.each,
    CollectionProto;

// Generic collection
function Collection() {
    this._construct.apply(this, arguments);
}

CollectionProto = {
    _construct: function ( items ) {
        this._items = Y.Lang.isArray( items ) ?
            items :
            YArray( items, 0, true );
    },

    item: function ( i ) {
        return this._items[i];
    },

    each: function ( fn, context ) {
        YArray_each( this._items, function ( item, i ) {
            item = this.item( i );

            return fn.call( context || item, item, i, this );
        }, this);

        return this;
    },

    some: function ( fn, context ) {
        return YArray.some( this._items, function ( item, i ) {
            item = this.item( i );

            return fn.call( context || item, item, i, this );
        }, this);
    },

    indexOf: function ( needle ) {
        return YArray.indexOf( this._items, needle );
    },

    filter: function ( validator ) {
        var items = [];

        YArray_each( this._items, function ( item, i ) {
            item = this.item( i );

            if ( validator( item ) ) {
                items.push( item );
            }
        }, this);

        return new this.constructor( items );
    },

    modulus: function ( n, r ) {
        r = r || 0;

        var items = [];

        YArray_each( this._items, function ( item, i ) {
            if ( i % n === r ) {
                items.push( item );
            }
        }, this);

        return new this.constructor( items );
    },

    odd: function () {
        return this.modulus( 2, 1 );
    },

    even: function () {
        return this.modulus( 2 );
    },

    size: function () {
        return this._items.length;
    },

    isEmpty: function () {
        return !this.size();
    },

    add: function ( item ) {
        this._items.push( item );

        return this;
    },

    remove: function ( item ) {
        var i = this.indexOf( item );

        if (i > -1) {
            this._items.splice(i,1);
        }

        return this;
    }
};
// Default implementation does not distinguish between public and private
// item getter
CollectionProto._item = CollectionProto.item;
Collection.prototype  = CollectionProto;

Y.Collection = Collection;

Y.mix( Collection, {

    /**
     * Core factory method for creating collection classes.
     *
     * @method build
     * @param o {Function|Object} The seed constructor function or its prototype
     * @param config {Object} optional configuration for tweaking class build
     * @param proto {Object} optional prototype methods (will override)
     * @param statics {Object} optional static members for the collection class
     * @return {Function} the list class for the provided constructor
     * @static
     */
    build: function (o, config, proto, statics) {

        function C() {
            Collection.apply( this, arguments );
        }

        var isFunction = Y.Lang.isFunction,
            whitelist  = (config || {}).whitelist || o,
            prototype  = {},
            fn;

        // Accept an object or constructor
        o       = isFunction( o ) ? o.prototype : o;
        proto   = proto   || {};
        statics = statics || {};

        if ( Y.Lang.isArray( whitelist ) ) {
            whitelist = YArray.hash( whitelist );
        }

        for ( fn in whitelist ) {
            if ( isFunction( o[fn] ) ) {
                Collection._addMethod( o, fn, prototype );
            }
        }

        return Y.extend( C, Collection,      // superclass
            Y.mix( prototype, proto, true ), // prototype
            statics );                       // static members
    },

    _addMethod: function ( source, name, dest ) {

        dest[name] = function () {
            var args = YArray( arguments, 0, true ),
                ret  = [];

            YArray_each( this._items, function ( item, i ) {
                item = this._item( i );

                var result = item[name].apply( item, args );

                if ( result !== undefined && result !== item ) {
                    ret.push( result );
                }
            }, this);

            return ret.length ? ret : this;
        };
    }
});


}, '@VERSION@' );
