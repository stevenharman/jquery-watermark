/*	
	Watermark jQuery plugin v1.0
	
	Copyright (c) 2009 Todd Northrop
	http://www.speednet.biz/
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
------------------------------------------------------*/

(function ($) {

// Will speed up references to undefined, and allows munging its name.
var undefined;

// Extends jQuery with a custom selector - ":data(...)"
// :data(<name>)  Includes elements that have a specific name defined in the jQuery data collection. (Only the existence of the name is checked; the value is ignored.)
// :data(<name>=<value>)  Includes elements that have a specific jQuery data name defined, with a specific value associated with it.
// :data(<name>!=<value>)  Includes elements that have a specific jQuery data name defined, with a value that is not equal to the value specified.
// :data(<name>^=<value>)  Includes elements that have a specific jQuery data name defined, with a value that starts with the value specified.
// :data(<name>$=<value>)  Includes elements that have a specific jQuery data name defined, with a value that ends with the value specified.
// :data(<name>*=<value>)  Includes elements that have a specific jQuery data name defined, with a value that contains the value specified.
$.extend($.expr[":"], {
	"data": function (element, index, matches, set) {
		var data, parts = /^((?:[^=!^$*]|[!^$*](?!=))+)(?:([!^$*]?=)(.*))?$/.exec(matches[3]);
		if (parts) {
			data = $(element).data(parts[1]);
			
			if (data !== undefined) {

				if (parts[2]) {
					data = "" + data;
				
					switch (parts[2]) {
						case "=":
							return (data == parts[3]);
						case "!=":
							return (data != parts[3]);
						case "^=":
							return (data.slice(0, parts[3].length) == parts[3]);
						case "$=":
							return (data.slice(-parts[3].length) == parts[3]);
						case "*=":
							return (data.indexOf(parts[3]) !== -1);
					}
				}

				return true;
			}
		}
		
		return false;
	}
});

$.watermark = {

	// Default class name for all watermarks
	className: "watermark",
	
	// Hide one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	hide: function (selector) {
		$(selector).filter(":data(watermark)").each(
			function () {
				$.watermark._hide($(this));
			}
		);
	},

	// Internal use only.
	_hide: function ($input) {
	
		if ($input.val() == $input.data("watermarkText")) {
			$input.val("");
		}
		
		$input.removeClass($input.data("watermarkClass"));
	},
	
	// Display one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	// If conditions are not right for displaying a watermark, ensures that watermark is not shown.
	show: function (selector) {
		$(selector).filter(":data(watermark)").each(
			function () {
				$.watermark._show($(this));
			}
		);
	},
	
	// Internal use only.
	_show: function ($input) {
		var val = $input.val(), text = $input.data("watermarkText");

		if (((val.length == 0) || (val == text)) && (!$input.data("watermarkFocus"))) {
			$input.val(text);
			$input.addClass($input.data("watermarkClass"));
		}
		else {
			$.watermark._hide($input);
		}
	},
	
	// Hides all watermarks on the current page.
	hideAll: function () {
		$.watermark.hide(":text");
	},
	
	// Displays all watermarks on the current page.
	showAll: function () {
		$.watermark.show(":text");
	}
};

$.fn.watermark = function (text, className) {
	///	<summary>
	///		Set watermark text and class name on all input elements of type="text" within the matched set.
	///		If className is not included, the default is "watermark". Within the matched set, only input
	///		elements with type="text" are affected; all other elements are ignored.
	///	</summary>
	///	<returns type="jQuery">
	///		Returns the original jQuery matched set (not just the input elements).
	/// </returns>
	///	<param name="text" type="String">
	///		Text to display as a watermark when the input element has an empty value and does not have focus.
	///		The first time watermark() is called on an element, if this argument is empty (or not a String type),
	///		then the watermark will have the net effect of only changing the class name when the input element's
	///		value is empty and it does not have focus.
	///	</param>
	///	<param name="className" type="String" optional="true">
	///		Provides the ability to override the default class name of "watermark" with the supplied class name.
	///	</param>
	/// <remarks>
	///		The effect of changing the text and class name on an input element is called a watermark because
	///		typically light gray text is used to provide a hint as to what type of input is required. However,
	///		the appearance of the watermark can be something completely different: simply change the CSS style
	///		pertaining to the supplied class name.
	///		
	///		The first time watermark() is called on an element, the watermark text and class name are initialized,
	///		and the focus, blur, and change events are hooked in order to control the display of the watermark.
	///		
	///		Subsequently, watermark() can be called again on an element in order to change the watermark text
	///		and/or class name, and it can also be called without any arguments in order to refresh the display.
	///		
	///		For example, after changing the value of the input element programmatically, watermark() should be
	///		called without any arguments to refresh the display, because the change event is only triggered by
	///		user actions, not by programmatic changes to an input element's value.
	/// </remarks>
	
	var hasText = (typeof(text) === "string"), hasClass = (typeof(className) === "string");

	return this.filter(":text").each(
		function () {
			var $input = $(this);
			
			// Watermark already initialized?
			if ($input.data("watermark")) {
			
				// If re-defining text or class, first remove existing watermark, then make changes
				if (hasText || hasClass) {
					$.watermark._hide($input);
			
					if (hasText) {
						$input.data("watermarkText", text);
					}
					
					if (hasClass) {
						$input.data("watermarkClass", className);
					}
				}
			}
			else {
				$input.data("watermarkText", hasText? text : "");
				$input.data("watermarkClass", hasClass? className : $.watermark.className);
				$input.data("watermark", 1); // Flag indicates watermark was initialized
				$input.focus(
					function () {
						$input.data("watermarkFocus", 1);
						$.watermark._hide($input);
					}
				).blur(
					function () {
						$input.data("watermarkFocus", 0);
						$.watermark._show($input);
					}
				);
				
				var $form = $(this.form);
				
				if (!$form.data("watermark")) {
					$form.data("watermark", 1); // Flag ensures submit event only gets hooked once
					$form.submit($.watermark.hideAll);
				}
			}
			
			$.watermark._show($input);
		}
	).end();
};

})(jQuery);
