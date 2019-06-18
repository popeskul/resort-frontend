/*!
 * modernizr v3.5.0
 * Build https://modernizr.com/download?-flexbox-flexboxlegacy-flexboxtweener-setclasses-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
 */

(function(window, document, undefined) {
	const classes = [];

	const tests = [];

	/**
	 *
	 * ModernizrProto is the constructor for Modernizr
	 *
	 * @class
	 * @access public
	 */

	const ModernizrProto = {
		// The current version, dummy
		_version: '3.5.0',

		// Any settings that don't work as separate modules
		// can go in here as configuration.
		_config: {
			classPrefix: '',
			enableClasses: true,
			enableJSClass: true,
			usePrefixes: true,
		},

		// Queue of tests
		_q: [],

		// Stub these for people who are listening
		on(test, cb) {
			// I don't really think people should do this, but we can
			// safe guard it a bit.
			// -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
			// This is in case people listen to synchronous tests. I would leave it out,
			// but the code to *disallow* sync tests in the real version of this
			// function is actually larger than this.
			const self = this;
			setTimeout(() => {
				cb(self[test]);
			}, 0);
		},

		addTest(name, fn, options) {
			tests.push({ name, fn, options });
		},

		addAsyncTest(fn) {
			tests.push({ name: null, fn });
		},
	};

	// Fake some of Object.create so we can force non test results to be non "own" properties.
	let Modernizr = function() {};
	Modernizr.prototype = ModernizrProto;

	// Leak modernizr globally when you `require` it rather than force it here.
	// Overwrite name so constructor name is nicer :D
	Modernizr = new Modernizr();

	/**
	 * is returns a boolean if the typeof an obj is exactly type.
	 *
	 * @access private
	 * @function is
	 * @param {*} obj - A thing we want to check the type of
	 * @param {string} type - A string to compare the typeof against
	 * @returns {boolean}
	 */

	function is(obj, type) {
		return typeof obj === type;
	}
	/**
	 * Run through all tests and detect their support in the current UA.
	 *
	 * @access private
	 */

	function testRunner() {
		let featureNames;
		let feature;
		let aliasIdx;
		let result;
		let nameIdx;
		let featureName;
		let featureNameSplit;

		for (const featureIdx in tests) {
			if (tests.hasOwnProperty(featureIdx)) {
				featureNames = [];
				feature = tests[featureIdx];
				// run the test, throw the return value into the Modernizr,
				// then based on that boolean, define an appropriate className
				// and push it into an array of classes we'll join later.
				//
				// If there is no name, it's an 'async' test that is run,
				// but not directly added to the object. That should
				// be done with a post-run addTest call.
				if (feature.name) {
					featureNames.push(feature.name.toLowerCase());

					if (feature.options && feature.options.aliases && feature.options.aliases.length) {
						// Add all the aliases into the names list
						for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
							featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
						}
					}
				}

				// Run the test, or use the raw value if it's not a function
				result = is(feature.fn, 'function') ? feature.fn() : feature.fn;

				// Set each of the names on the Modernizr object
				for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
					featureName = featureNames[nameIdx];
					// Support dot properties as sub tests. We don't do checking to make sure
					// that the implied parent tests have been added. You must call them in
					// order (either in the test, or make the parent test a dependency).
					//
					// Cap it to TWO to make the logic simple and because who needs that kind of subtesting
					// hashtag famous last words
					featureNameSplit = featureName.split('.');

					if (featureNameSplit.length === 1) {
						Modernizr[featureNameSplit[0]] = result;
					} else {
						// cast to a Boolean, if not one already
						if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
							Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
						}

						Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
					}

					classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
				}
			}
		}
	}
	/**
	 * docElement is a convenience wrapper to grab the root element of the document
	 *
	 * @access private
	 * @returns {HTMLElement|SVGElement} The root element of the document
	 */

	const docElement = document.documentElement;

	/**
	 * A convenience helper to check if the document we are running in is an SVG document
	 *
	 * @access private
	 * @returns {boolean}
	 */

	const isSVG = docElement.nodeName.toLowerCase() === 'svg';

	/**
	 * setClasses takes an array of class names and adds them to the root element
	 *
	 * @access private
	 * @function setClasses
	 * @param {string[]} classes - Array of class names
	 */

	// Pass in an and array of class names, e.g.:
	//  ['no-webp', 'borderradius', ...]
	function setClasses(classes) {
		let { className } = docElement;
		const classPrefix = Modernizr._config.classPrefix || '';

		if (isSVG) {
			className = className.baseVal;
		}

		// Change `no-js` to `js` (independently of the `enableClasses` option)
		// Handle classPrefix on this too
		if (Modernizr._config.enableJSClass) {
			const reJS = new RegExp(`(^|\\s)${classPrefix}no-js(\\s|$)`);
			className = className.replace(reJS, `$1${classPrefix}js$2`);
		}

		if (Modernizr._config.enableClasses) {
			// Add the new classes
			className += ` ${classPrefix}${classes.join(` ${classPrefix}`)}`;
			if (isSVG) {
				docElement.className.baseVal = className;
			} else {
				docElement.className = className;
			}
		}
	}

	/**
	 * If the browsers follow the spec, then they would expose vendor-specific styles as:
	 *   elem.style.WebkitBorderRadius
	 * instead of something like the following (which is technically incorrect):
	 *   elem.style.webkitBorderRadius

	 * WebKit ghosts their properties in lowercase but Opera & Moz do not.
	 * Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
	 *   erik.eae.net/archives/2008/03/10/21.48.10/

	 * More here: github.com/Modernizr/Modernizr/issues/issue/21
	 *
	 * @access private
	 * @returns {string} The string representing the vendor-specific style properties
	 */

	const omPrefixes = 'Moz O ms Webkit';

	const cssomPrefixes = ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : [];
	ModernizrProto._cssomPrefixes = cssomPrefixes;

	/**
	 * List of JavaScript DOM values used for tests
	 *
	 * @memberof Modernizr
	 * @name Modernizr._domPrefixes
	 * @optionName Modernizr._domPrefixes
	 * @optionProp domPrefixes
	 * @access public
	 * @example
	 *
	 * Modernizr._domPrefixes is exactly the same as [_prefixes](#modernizr-_prefixes), but rather
	 * than kebab-case properties, all properties are their Capitalized variant
	 *
	 * ```js
	 * Modernizr._domPrefixes === [ "Moz", "O", "ms", "Webkit" ];
	 * ```
	 */

	const domPrefixes = ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : [];
	ModernizrProto._domPrefixes = domPrefixes;

	/**
	 * createElement is a convenience wrapper around document.createElement. Since we
	 * use createElement all over the place, this allows for (slightly) smaller code
	 * as well as abstracting away issues with creating elements in contexts other than
	 * HTML documents (e.g. SVG documents).
	 *
	 * @access private
	 * @function createElement
	 * @returns {HTMLElement|SVGElement} An HTML or SVG element
	 */

	function createElement() {
		if (typeof document.createElement !== 'function') {
			// This is the case in IE7, where the type of createElement is "object".
			// For this reason, we cannot call apply() as Object is not a Function.
			return document.createElement(arguments[0]);
		}
		if (isSVG) {
			return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
		}
		return document.createElement(...arguments);
	}

	/**
	 * cssToDOM takes a kebab-case string and converts it to camelCase
	 * e.g. box-sizing -> boxSizing
	 *
	 * @access private
	 * @function cssToDOM
	 * @param {string} name - String name of kebab-case prop we want to convert
	 * @returns {string} The camelCase version of the supplied name
	 */

	function cssToDOM(name) {
		return name.replace(/([a-z])-([a-z])/g, (str, m1, m2) => m1 + m2.toUpperCase()).replace(/^-/, '');
	}
	/**
	 * contains checks to see if a string contains another string
	 *
	 * @access private
	 * @function contains
	 * @param {string} str - The string we want to check for substrings
	 * @param {string} substr - The substring we want to search the first string for
	 * @returns {boolean}
	 */

	function contains(str, substr) {
		return !!~`${str}`.indexOf(substr);
	}

	/**
	 * fnBind is a super small [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) polyfill.
	 *
	 * @access private
	 * @function fnBind
	 * @param {function} fn - a function you want to change `this` reference to
	 * @param {object} that - the `this` you want to call the function with
	 * @returns {function} The wrapped version of the supplied function
	 */

	function fnBind(fn, that) {
		return function() {
			return fn.apply(that, arguments);
		};
	}

	/**
	 * testDOMProps is a generic DOM property test; if a browser supports
	 *   a certain property, it won't return undefined for it.
	 *
	 * @access private
	 * @function testDOMProps
	 * @param {array.<string>} props - An array of properties to test for
	 * @param {object} obj - An object or Element you want to use to test the parameters again
	 * @param {boolean|object} elem - An Element to bind the property lookup again. Use `false` to prevent the check
	 * @returns {false|*} returns false if the prop is unsupported, otherwise the value that is supported
	 */
	function testDOMProps(props, obj, elem) {
		let item;

		for (const i in props) {
			if (props[i] in obj) {
				// return the property name as a string
				if (elem === false) {
					return props[i];
				}

				item = obj[props[i]];

				// let's bind a function
				if (is(item, 'function')) {
					// bind to obj unless overriden
					return fnBind(item, elem || obj);
				}

				// return the unbound function or obj or value
				return item;
			}
		}
		return false;
	}

	/**
	 * Create our "modernizr" element that we do most feature tests on.
	 *
	 * @access private
	 */

	const modElem = {
		elem: createElement('modernizr'),
	};

	// Clean up this element
	Modernizr._q.push(() => {
		delete modElem.elem;
	});

	const mStyle = {
		style: modElem.elem.style,
	};

	// kill ref for gc, must happen before mod.elem is removed, so we unshift on to
	// the front of the queue.
	Modernizr._q.unshift(() => {
		delete mStyle.style;
	});

	/**
	 * wrapper around getComputedStyle, to fix issues with Firefox returning null when
	 * called inside of a hidden iframe
	 *
	 * @access private
	 * @function computedStyle
	 * @param {HTMLElement|SVGElement} - The element we want to find the computed styles of
	 * @param {string|null} [pseudoSelector]- An optional pseudo element selector (e.g. :before), of null if none
	 * @returns {CSSStyleDeclaration}
	 */

	function computedStyle(elem, pseudo, prop) {
		let result;

		if ('getComputedStyle' in window) {
			result = getComputedStyle.call(window, elem, pseudo);
			const { console } = window;

			if (result !== null) {
				if (prop) {
					result = result.getPropertyValue(prop);
				}
			} else if (console) {
				const method = console.error ? 'error' : 'log';
				console[method].call(
					console,
					'getComputedStyle returning null, its possible modernizr test results are inaccurate'
				);
			}
		} else {
			result = !pseudo && elem.currentStyle && elem.currentStyle[prop];
		}

		return result;
	}

	/**
	 * domToCSS takes a camelCase string and converts it to kebab-case
	 * e.g. boxSizing -> box-sizing
	 *
	 * @access private
	 * @function domToCSS
	 * @param {string} name - String name of camelCase prop we want to convert
	 * @returns {string} The kebab-case version of the supplied name
	 */

	function domToCSS(name) {
		return name.replace(/([A-Z])/g, (str, m1) => `-${m1.toLowerCase()}`).replace(/^ms-/, '-ms-');
	}
	/**
	 * getBody returns the body of a document, or an element that can stand in for
	 * the body if a real body does not exist
	 *
	 * @access private
	 * @function getBody
	 * @returns {HTMLElement|SVGElement} Returns the real body of a document, or an
	 * artificially created element that stands in for the body
	 */

	function getBody() {
		// After page load injecting a fake body doesn't work so check if body exists
		let { body } = document;

		if (!body) {
			// Can't use the real body create a fake one.
			body = createElement(isSVG ? 'svg' : 'body');
			body.fake = true;
		}

		return body;
	}

	/**
	 * injectElementWithStyles injects an element with style element and some CSS rules
	 *
	 * @access private
	 * @function injectElementWithStyles
	 * @param {string} rule - String representing a css rule
	 * @param {function} callback - A function that is used to test the injected element
	 * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
	 * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
	 * @returns {boolean}
	 */

	function injectElementWithStyles(rule, callback, nodes, testnames) {
		const mod = 'modernizr';
		let style;
		let ret;
		let node;
		let docOverflow;
		const div = createElement('div');
		const body = getBody();

		if (parseInt(nodes, 10)) {
			// In order not to give false positives we create a node for each test
			// This also allows the method to scale for unspecified uses
			while (nodes--) {
				node = createElement('div');
				node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
				div.appendChild(node);
			}
		}

		style = createElement('style');
		style.type = 'text/css';
		style.id = `s${mod}`;

		// IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
		// Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
		(!body.fake ? div : body).appendChild(style);
		body.appendChild(div);

		if (style.styleSheet) {
			style.styleSheet.cssText = rule;
		} else {
			style.appendChild(document.createTextNode(rule));
		}
		div.id = mod;

		if (body.fake) {
			// avoid crashing IE8, if background image is used
			body.style.background = '';
			// Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
			body.style.overflow = 'hidden';
			docOverflow = docElement.style.overflow;
			docElement.style.overflow = 'hidden';
			docElement.appendChild(body);
		}

		ret = callback(div, rule);
		// If this is done after page load we don't want to remove the body so check if body exists
		if (body.fake) {
			body.parentNode.removeChild(body);
			docElement.style.overflow = docOverflow;
			// Trigger layout so kinetic scrolling isn't disabled in iOS6+
			// eslint-disable-next-line
			docElement.offsetHeight;
		} else {
			div.parentNode.removeChild(div);
		}

		return !!ret;
	}

	/**
	 * nativeTestProps allows for us to use native feature detection functionality if available.
	 * some prefixed form, or false, in the case of an unsupported rule
	 *
	 * @access private
	 * @function nativeTestProps
	 * @param {array} props - An array of property names
	 * @param {string} value - A string representing the value we want to check via @supports
	 * @returns {boolean|undefined} A boolean when @supports exists, undefined otherwise
	 */

	// Accepts a list of property names and a single value
	// Returns `undefined` if native detection not available
	function nativeTestProps(props, value) {
		let i = props.length;
		// Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
		if ('CSS' in window && 'supports' in window.CSS) {
			// Try every prefixed variant of the property
			while (i--) {
				if (window.CSS.supports(domToCSS(props[i]), value)) {
					return true;
				}
			}
			return false;
		}
		if ('CSSSupportsRule' in window) {
			// Otherwise fall back to at-rule (for Opera 12.x)
			// Build a condition string for every prefixed variant
			let conditionText = [];
			while (i--) {
				conditionText.push(`(${domToCSS(props[i])}:${value})`);
			}
			conditionText = conditionText.join(' or ');
			return injectElementWithStyles(
				`@supports (${conditionText}) { #modernizr { position: absolute; } }`,
				node => computedStyle(node, null, 'position') == 'absolute'
			);
		}
		return undefined;
	}
	// testProps is a generic CSS / DOM property test.

	// In testing support for a given CSS property, it's legit to test:
	//    `elem.style[styleName] !== undefined`
	// If the property is supported it will return an empty string,
	// if unsupported it will return undefined.

	// We'll take advantage of this quick test and skip setting a style
	// on our modernizr element, but instead just testing undefined vs
	// empty string.

	// Property names can be provided in either camelCase or kebab-case.

	function testProps(props, prefixed, value, skipValueTest) {
		skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

		// Try native detect first
		if (!is(value, 'undefined')) {
			const result = nativeTestProps(props, value);
			if (!is(result, 'undefined')) {
				return result;
			}
		}

		// Otherwise do it properly
		let afterInit;
		let i;
		let propsLength;
		let prop;
		let before;

		// If we don't have a style element, that means we're running async or after
		// the core tests, so we'll need to create our own elements to use

		// inside of an SVG element, in certain browsers, the `style` element is only
		// defined for valid tags. Therefore, if `modernizr` does not have one, we
		// fall back to a less used element and hope for the best.
		// for strict XHTML browsers the hardly used samp element is used
		const elems = ['modernizr', 'tspan', 'samp'];
		while (!mStyle.style && elems.length) {
			afterInit = true;
			mStyle.modElem = createElement(elems.shift());
			mStyle.style = mStyle.modElem.style;
		}

		// Delete the objects if we created them.
		function cleanElems() {
			if (afterInit) {
				delete mStyle.style;
				delete mStyle.modElem;
			}
		}

		propsLength = props.length;
		for (i = 0; i < propsLength; i++) {
			prop = props[i];
			before = mStyle.style[prop];

			if (contains(prop, '-')) {
				prop = cssToDOM(prop);
			}

			if (mStyle.style[prop] !== undefined) {
				// If value to test has been passed in, do a set-and-check test.
				// 0 (integer) is a valid property value, so check that `value` isn't
				// undefined, rather than just checking it's truthy.
				if (!skipValueTest && !is(value, 'undefined')) {
					// Needs a try catch block because of old IE. This is slow, but will
					// be avoided in most cases because `skipValueTest` will be used.
					try {
						mStyle.style[prop] = value;
					} catch (e) {}

					// If the property value has changed, we assume the value used is
					// supported. If `value` is empty string, it'll fail here (because
					// it hasn't changed), which matches how browsers have implemented
					// CSS.supports()
					if (mStyle.style[prop] != before) {
						cleanElems();
						return prefixed == 'pfx' ? prop : true;
					}
				} else {
					// Otherwise just return true, or the property name if this is a
					// `prefixed()` call
					cleanElems();
					return prefixed == 'pfx' ? prop : true;
				}
			}
		}
		cleanElems();
		return false;
	}

	/**
	 * testPropsAll tests a list of DOM properties we want to check against.
	 * We specify literally ALL possible (known and/or likely) properties on
	 * the element including the non-vendor prefixed one, for forward-
	 * compatibility.
	 *
	 * @access private
	 * @function testPropsAll
	 * @param {string} prop - A string of the property to test for
	 * @param {string|object} [prefixed] - An object to check the prefixed properties on. Use a string to skip
	 * @param {HTMLElement|SVGElement} [elem] - An element used to test the property and value against
	 * @param {string} [value] - A string of a css value
	 * @param {boolean} [skipValueTest] - An boolean representing if you want to test if value sticks when set
	 * @returns {false|string} returns the string version of the property, or false if it is unsupported
	 */
	function testPropsAll(prop, prefixed, elem, value, skipValueTest) {
		const ucProp = prop.charAt(0).toUpperCase() + prop.slice(1);
		let props = `${prop} ${cssomPrefixes.join(`${ucProp} `)}${ucProp}`.split(' ');

		// did they call .prefixed('boxSizing') or are we just testing a prop?
		if (is(prefixed, 'string') || is(prefixed, 'undefined')) {
			return testProps(props, prefixed, value, skipValueTest);

			// otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
		}
		props = `${prop} ${domPrefixes.join(`${ucProp} `)}${ucProp}`.split(' ');
		return testDOMProps(props, prefixed, elem);
	}

	// Modernizr.testAllProps() investigates whether a given style property,
	// or any of its vendor-prefixed variants, is recognized
	//
	// Note that the property names must be provided in the camelCase variant.
	// Modernizr.testAllProps('boxSizing')
	ModernizrProto.testAllProps = testPropsAll;

	/**
	 * testAllProps determines whether a given CSS property is supported in the browser
	 *
	 * @memberof Modernizr
	 * @name Modernizr.testAllProps
	 * @optionName Modernizr.testAllProps()
	 * @optionProp testAllProps
	 * @access public
	 * @function testAllProps
	 * @param {string} prop - String naming the property to test (either camelCase or kebab-case)
	 * @param {string} [value] - String of the value to test
	 * @param {boolean} [skipValueTest=false] - Whether to skip testing that the value is supported when using non-native detection
	 * @example
	 *
	 * testAllProps determines whether a given CSS property, in some prefixed form,
	 * is supported by the browser.
	 *
	 * ```js
	 * testAllProps('boxSizing')  // true
	 * ```
	 *
	 * It can optionally be given a CSS value in string form to test if a property
	 * value is valid
	 *
	 * ```js
	 * testAllProps('display', 'block') // true
	 * testAllProps('display', 'penguin') // false
	 * ```
	 *
	 * A boolean can be passed as a third parameter to skip the value check when
	 * native detection (@supports) isn't available.
	 *
	 * ```js
	 * testAllProps('shapeOutside', 'content-box', true);
	 * ```
	 */

	function testAllProps(prop, value, skipValueTest) {
		return testPropsAll(prop, undefined, undefined, value, skipValueTest);
	}
	ModernizrProto.testAllProps = testAllProps;

	/*!
	 {
	 "name": "Flexbox",
	 "property": "flexbox",
	 "caniuse": "flexbox",
	 "tags": ["css"],
	 "notes": [{
	 "name": "The _new_ flexbox",
	 "href": "http://dev.w3.org/csswg/css3-flexbox"
	 }],
	 "warnings": [
	 "A `true` result for this detect does not imply that the `flex-wrap` property is supported; see the `flexwrap` detect."
	 ]
	 }
	 ! */
	/* DOC
	 Detects support for the Flexible Box Layout model, a.k.a. Flexbox, which allows easy manipulation of layout order and sizing within a container.
	 */

	Modernizr.addTest('flexbox', testAllProps('flexBasis', '1px', true));

	/*!
	 {
	 "name": "Flexbox (legacy)",
	 "property": "flexboxlegacy",
	 "tags": ["css"],
	 "polyfills": ["flexie"],
	 "notes": [{
	 "name": "The _old_ flexbox",
	 "href": "https://www.w3.org/TR/2009/WD-css3-flexbox-20090723/"
	 }]
	 }
	 ! */

	Modernizr.addTest('flexboxlegacy', testAllProps('boxDirection', 'reverse', true));

	/*!
	 {
	 "name": "Flexbox (tweener)",
	 "property": "flexboxtweener",
	 "tags": ["css"],
	 "polyfills": ["flexie"],
	 "notes": [{
	 "name": "The _inbetween_ flexbox",
	 "href": "https://www.w3.org/TR/2011/WD-css3-flexbox-20111129/"
	 }],
	 "warnings": ["This represents an old syntax, not the latest standard syntax."]
	 }
	 ! */

	Modernizr.addTest('flexboxtweener', testAllProps('flexAlign', 'end', true));

	// Run each test
	testRunner();

	// Remove the "no-js" class if it exists
	setClasses(classes);

	delete ModernizrProto.addTest;
	delete ModernizrProto.addAsyncTest;

	// Run the things that are supposed to run after the tests
	for (let i = 0; i < Modernizr._q.length; i++) {
		Modernizr._q[i]();
	}

	// Leak Modernizr namespace
	window.Modernizr = Modernizr;
})(window, document);