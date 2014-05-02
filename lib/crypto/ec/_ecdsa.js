var secureRandom = require('./_secureRandom.js');

var ECPointFp = require('./_ecurve.js').ECPointFp;
var BigInteger = require('./_bigi.js');

module.exports = function(p){
    return new ECDSA(p);
};

//rng stub, consider removing secureRandom
var rng = {
  nextBytes: function(arr) {
    var byteArr = secureRandom(arr.length);
    for (var i = 0; i < byteArr.length; ++i)
      arr[i] = byteArr[i];
  },
};


function implShamirsTrick(P, k, Q, l) {
  var m = Math.max(k.bitLength(), l.bitLength());
  var Z = P.add2D(Q);
  var R = P.curve.getInfinity();

  for (var i = m - 1; i >= 0; --i) {
    R = R.twice2D();

    R.z = BigInteger.ONE;

    if (k.testBit(i)) {
      if (l.testBit(i)) {
        R = R.add2D(Z);
      } else {
        R = R.add2D(P);
      }
    } else {
      if (l.testBit(i)) {
        R = R.add2D(Q);
      }
    }
  }

  return R;
};

function deterministicGenerateK(hash, secret) {
  var vArr = []
  var kArr = []
  for (var i = 0;i < 32;i++) vArr.push(1)
  for (var i = 0;i < 32;i++) kArr.push(0)
  var v = convert.bytesToWordArray(vArr)
  var k = convert.bytesToWordArray(kArr)

  k = HmacSHA256(convert.bytesToWordArray(vArr.concat([0]).concat(secret).concat(hash)), k)
  v = HmacSHA256(v, k)
  vArr = convert.wordArrayToBytes(v)
  k = HmacSHA256(convert.bytesToWordArray(vArr.concat([1]).concat(secret).concat(hash)), k)
  v = HmacSHA256(v,k)
  v = HmacSHA256(v,k)
  vArr = convert.wordArrayToBytes(v)
  return BigInteger.fromBuffer(vArr)
}


function ECDSA(ecparams) {
    var self = this;

    var P_OVER_FOUR = null;
    
    /* exposed functions */
    this.sign = function (hash, priv) {
        if ($.tools.type.isBuffer(hash)) hash = Array.prototype.slice.call(hash)
        if ($.tools.type.isBuffer(priv)) priv = Array.prototype.slice.call(priv)

        var d = priv;
        var n = ecparams.getN();
        var e = BigInteger.fromBuffer(hash);

        var k = getBigRandom(n); //Following: replaced with RFC6979
    //    var k = deterministicGenerateK(hash,priv.toByteArrayUnsigned())
        var G = ecparams.getG();
        var Q = G.multiply(k);
        var r = Q.getX().toBigInteger().mod(n);

        var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n)

        if (s.compareTo(n.divide(BigInteger.valueOf(2))) > 0) {
            // Make 's' value 'low', as per https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki#low-s-values-in-signatures
            s = n.subtract(s);
        };

        return serializeSig(r, s)
    };
    
    this.verify = function (hash, sig, pubkey) {
        var r,s
        if (Array.isArray(sig) || $.node.tools.type.isBuffer(sig)) {
            var obj = parseSig(sig);
            r = obj.r
            s = obj.s
        } else if ("object" === typeof sig && sig.r && sig.s) {
            r = sig.r
            s = sig.s
        } else {
            throw new Error("Invalid value for signature")
        }

        var Q
        if (pubkey instanceof ECPointFp) {
            Q = pubkey
        } else if (Array.isArray(pubkey) || $.node.tools.type.isBuffer(pubkey)) {
            Q = ECPointFp.decodeFrom(ecparams.getCurve(), pubkey)
        } else {
            throw new Error("Invalid format for pubkey value, must be byte array or ECPointFp")
        }
        var e = BigInteger.fromBuffer(hash)

        return verifyRaw(e, r, s, Q)
    };



    /* implementations */
    function verifyRaw(e, r, s, Q) {
        var n = ecparams.getN();
        var G = ecparams.getG();

        if(r.compareTo(BigInteger.ONE) < 0 || r.compareTo(n) >= 0)
            return false;

        if(s.compareTo(BigInteger.ONE) < 0 || s.compareTo(n) >= 0)
            return false;

        var c = s.modInverse(n);

        var u1 = e.multiply(c).mod(n);
        var u2 = r.multiply(c).mod(n);

        // TODO(!!!): For some reason Shamir's trick isn't working with
        // signed message verification!? Probably an implementation
        // error!
        //var point = implShamirsTrick(G, u1, Q, u2);
        var point = G.multiply(u1).add(Q.multiply(u2));

        var v = point.getX().toBigInteger().mod(n);
        return v.equals(r);
    };

    function parseSigCompact(sig) {
        if(sig.length !== 65) 
            throw $.error("Signature has the wrong length");

        // Signature is prefixed with a type byte storing three bits of
        // information.
        var i = sig[0] - 27;
        if (i < 0 || i > 7)
            throw $.error("Invalid signature type");

        var n = ecparams.getN();
        var r = BigInteger.fromByteArrayUnsigned(sig.slice(1, 33)).mod(n);
        var s = BigInteger.fromByteArrayUnsigned(sig.slice(33, 65)).mod(n);

        return {r: r, s: s, i: i};
    };

    function getBigRandom(limit) {
        return new BigInteger(limit.bitLength(), rng)
            .mod(limit.subtract(BigInteger.ONE))
            .add(BigInteger.ONE)
        ;
    };


    /*
     * Serialize a signature into DER format.
     *
     * Takes two BigIntegers representing r and s and returns a byte array.
     */
    function serializeSig(r, s) {
        var rBa = r.toByteArraySigned();
        var sBa = s.toByteArraySigned();

        var sequence = [];
        sequence.push(0x02); // INTEGER
        sequence.push(rBa.length);
        sequence = sequence.concat(rBa);

        sequence.push(0x02); // INTEGER
        sequence.push(sBa.length);
        sequence = sequence.concat(sBa);

        sequence.unshift(sequence.length);
        sequence.unshift(0x30); // SEQUENCE

        return sequence;
    };

    /*
     * Parses a byte array containing a DER-encoded signature.
     *
     * This function will return an object of the form:
     *
     * {
     *   r: BigInteger,
     *   s: BigInteger
     * }
     */
    function parseSig(sig) {
      var cursor;
      if (sig[0] != 0x30)
        throw new Error("Signature not a valid DERSequence");

      cursor = 2;
      if (sig[cursor] != 0x02)
        throw new Error("First element in signature must be a DERInteger");;
      var rBa = sig.slice(cursor+2, cursor+2+sig[cursor+1]);

      cursor += 2+sig[cursor+1];
      if (sig[cursor] != 0x02)
        throw new Error("Second element in signature must be a DERInteger");
      var sBa = sig.slice(cursor+2, cursor+2+sig[cursor+1]);

      cursor += 2+sig[cursor+1];

      //if (cursor != sig.length)
      //  throw new Error("Extra bytes in signature");

      var r = BigInteger.fromByteArrayUnsigned(rBa);
      var s = BigInteger.fromByteArrayUnsigned(sBa);

      return {r: r, s: s};
    }

    return this;
};
