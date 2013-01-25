// Generated by CoffeeScript 1.3.3
(function() {
  var FIASCalculator, FinalScore, Score, ScoreColor, fixValue;

  $.fn.message = function() {
    return $("#" + ($(this).data("message-id")));
  };

  fixValue = function(dial, value) {
    if (value < dial.o.min) {
      return dial.o.min;
    } else if (value > dial.o.max) {
      return dial.o.max;
    } else {
      return value;
    }
  };

  FIASCalculator = (function() {

    function FIASCalculator() {
      var changed;
      $("[data-dial]").knob({
        min: 1,
        max: 10,
        fgColor: "#468847",
        angleOffset: "-125",
        angleArc: "250",
        thickness: "0.3",
        change: this.changed,
        draw: this.updateFinalScore
      });
      $("#final-score").knob({
        min: 3,
        max: 30,
        fgColor: "#C09853",
        thickness: 0.5,
        width: 300,
        height: 400,
        readOnly: true
      });
      this.parseURL();
      changed = this.changed;
      $("[data-dial]").each(function() {
        return changed.call($(this).data("knob"), $(this).val());
      });
      this.setupCopyButton();
    }

    FIASCalculator.prototype.changed = function(value) {
      var $input, $message, score;
      value = fixValue(this, value);
      $input = $(this.i);
      $message = $input.message();
      score = new Score($input.data("dial"), value);
      $message.html(score.message);
      $message.removeClass(score.cssClasses().join(" "));
      $message.addClass(score.css);
      return $input.trigger("configure", {
        fgColor: score.color
      });
    };

    FIASCalculator.prototype.updateFinalScore = function() {
      var $message, knob, score, values;
      values = $("[data-dial]").map(function(_, dial) {
        return parseInt($(dial).val());
      }).toArray();
      knob = $("#final-score").data("knob");
      if (knob) {
        score = new FinalScore(values);
        knob.val(score.total);
        knob.$.trigger("configure", {
          fgColor: score.color
        });
        $message = knob.$.message();
        $message.html(score.message());
        return score.updateURL();
      }
    };

    FIASCalculator.prototype.parseURL = function() {
      var values;
      if (window.location.search) {
        values = [this.getParameterByName("v1"), this.getParameterByName("v2"), this.getParameterByName("v3")];
        return $("[data-dial]").each(function(i, elem) {
          return $(elem).data("knob").val(values[i]);
        });
      }
    };

    FIASCalculator.prototype.getParameterByName = function(name) {
      var regex, regexS, results;
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      regexS = "[\\?&]" + name + "=([^&#]*)";
      regex = new RegExp(regexS);
      results = regex.exec(window.location.search);
      if (results === null) {
        return "";
      } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
      }
    };

    FIASCalculator.prototype.setupCopyButton = function() {
      var clip;
      ZeroClipboard.setMoviePath('/js/ZeroClipboard10.swf');
      clip = new ZeroClipboard.Client();
      clip.glue("final-copy-btn", "final-copy-btn-div");
      clip.addEventListener("mouseDown", function(client) {
        return client.setText($("#final-message").val());
      });
      return clip.addEventListener("complete", function() {
        var btn;
        btn = $("#final-copy-btn");
        btn.data("old-html", btn.html());
        btn.html("Copied!");
        return setTimeout(function() {
          return btn.html(btn.data("old-html"));
        }, 2000);
      });
    };

    return FIASCalculator;

  })();

  Score = (function() {
    var messages;

    messages = [["Equivalent to a single partial", "A small handful of views", "It's everywhere, like the plague"], ["Nothing - it's straight forward", "I understand what it's doing, but I'm not 100% sure about parts", "It's freaking greek"], ["Dude, it's a copy change", "I could see some potential for problems, but they seem unlikely to have humongous impact", "I can imagine about 400 ways this blows up"]];

    function Score(type, value) {
      var index;
      index = value <= 3 ? 0 : value >= 4 && value <= 6 ? 1 : 2;
      this.type = type;
      this.value = value;
      this.index = index;
      this.message = messages[this.type][this.index];
      this.scoreColor = new ScoreColor(this.index);
      this.css = this.scoreColor.css;
      this.color = this.scoreColor.color;
    }

    Score.prototype.cssClasses = function() {
      return this.scoreColor.cssClasses();
    };

    return Score;

  })();

  ScoreColor = (function() {
    var colors;

    colors = [
      {
        css: "alert-success",
        color: "#468847"
      }, {
        css: "alert-warning",
        color: "#C09853"
      }, {
        css: "alert-error",
        color: "#B94A48"
      }
    ];

    function ScoreColor(index) {
      this.css = colors[index].css;
      this.color = colors[index].color;
    }

    ScoreColor.prototype.cssClasses = function() {
      return colors.map(function(color) {
        return color.css;
      });
    };

    return ScoreColor;

  })();

  FinalScore = (function() {

    function FinalScore(values) {
      var index;
      this.values = values;
      this.total = values.reduce(function(sum, v) {
        return sum + v;
      }, 0);
      index = this.total <= 14 ? 0 : this.total >= 15 && this.total <= 19 ? 1 : 2;
      this.scoreColor = new ScoreColor(index);
      this.css = this.scoreColor.css;
      this.color = this.scoreColor.color;
    }

    FinalScore.prototype.cssClasses = function() {
      return this.scoreColor.cssClasses();
    };

    FinalScore.prototype.message = function() {
      return "[FIAS: " + (this.values.join(" / ")) + " = " + this.total + "](" + window.location.origin + (this.queryString()) + ")";
    };

    FinalScore.prototype.queryString = function() {
      return "?" + ($.param({
        v1: this.values[0],
        v2: this.values[1],
        v3: this.values[2]
      }));
    };

    FinalScore.prototype.updateURL = function() {
      return window.history.replaceState(null, null, this.queryString());
    };

    return FinalScore;

  })();

  window.FIASCalculator = FIASCalculator;

}).call(this);
