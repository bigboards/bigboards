#angular-flip directive
***
[AngularJS](http://angularjs.org/) directive that allows to achieve 3D card flip
effect.

##Quick start
***

Load `angular-flip.css` and `angular-flip.js` into your html:
```html
<link rel="stylesheet" href="/path/to/angular-flip.css" />
<script src="/path/to/angular-flip.js"></script>
```

Inject `angular-flip` into your application module:
```javascript
var app = angular.module('MyApp', ['drFlip']);
```

Have fun:
```html
<dr-flip dr-flip-toggle>
    <dr-flip-front>Visible content goes there</dr-flip-front>
    <dr-flip-back>The other side</dr-flip-back>
</dr-flip>
```

##License
***
`angular-flip` uses the [MIT](http://opensource.org/licenses/MIT) license