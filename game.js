(function() {
  function init() {
    let currentGame = new Game(10);
    let currentDisplay = new GameDisplay(currentGame);
  }

  document.addEventListener("DOMContentLoaded", init);

  class Game {
    constructor(maxRounds) {
      this.pass = 0;
      this.fail = 0;
      this.rounds = 0;
      
      this.remainingArticles = structuredClone(ARTICLES);
      this.usedArticles = [];
      this.currentArticle;
      
      this.maxRounds = Math.min(maxRounds, this.remainingArticles.length);
    }

    getNextSet() {
      let selectedArticleIdx = Math.floor(Math.random() * this.remainingArticles.length);
      this.usedArticles.push(selectedArticleIdx);
      let article = this.remainingArticles.splice(selectedArticleIdx, 1)[0];
      this.currentArticle = article;
      return article;
    }

    selectArticle(type) {
      this.rounds++;
      if (type === "real") {
        this.pass++;
      } else {
        this.fail++;
      }
    }

    gameIsOver() {
      return this.remainingArticles.length === 0 || this.rounds >= this.maxRounds;
    }
  }

  class GameDisplay {
    constructor(game) {
      this.game = game;

      this.mainView = document.getElementById("game-main-view");
      this.endView = document.getElementById("game-end-view");

      this.correct =    document.querySelectorAll(".game-correct");
      this.incorrect =  document.querySelectorAll(".game-incorrect");
      this.total =      document.querySelectorAll(".game-total");
      this.accuracy =   document.querySelectorAll(".game-accuracy");

      this.realAlert = document.getElementById("game-real-alert")
      this.fakeAlert = document.getElementById("game-fake-alert")
      this.fakeAlertAiName = document.getElementById("game-ai-name")
      this.sourceAlert = document.getElementById("game-real-source");
      this.sourceAlertLink = document.getElementById("game-real-source-link");

      this.content1 = document.getElementById("game-content-1");
      this.content2 = document.getElementById("game-content-2");

      this.title1 = document.getElementById("game-title-1");
      this.title2 = document.getElementById("game-title-2");

      this.confirmBtn = document.getElementById("game-confirm");
      this.nextBtn = document.getElementById("game-next");
      this.nextBtn.addEventListener("click", event => this.nextArticle())

      this.article1 = document.getElementById("game-article-1");
      this.article2 = document.getElementById("game-article-2");
      [this.article1, this.article2].forEach(element => {
        element.addEventListener("click", event => this.selectArticle(element))
      });

      this.confirmBtn.addEventListener("click", event => this.confirmArticle())

      // Start the game
      this.updateStats();
      this.nextArticle();
    }

    /**
     * Start the next round of the game
     */
    nextArticle() {
      if (this.game.gameIsOver()) {
        this.endGame();
        return;
      }

      // get new article set and update content
      let articleSet = this.game.getNextSet();
      this.setArticles(articleSet);

      // reset styles for a bunch of elems
      this.confirmBtn.classList.remove("d-none");
      this.confirmBtn.disabled = true;

      this.nextBtn.classList.add("d-none");
      this.nextBtn.disabled = true;

      this.realAlert.classList.add("d-none");
      this.fakeAlert.classList.add("d-none");
      this.sourceAlert.classList.add("d-none");

      this.article1.classList.remove("game-selected");
      this.article2.classList.remove("game-selected");
    }

    endGame() {
      this.mainView.classList.add("d-none");
      this.endView.classList.remove("d-none");
    }

    /**
     * Randomly select a game-box to be real/fake, and populate it with corresponding content
     * @param {Object} articlePair Article pair data
     */
    setArticles(articlePair){
      let article1real = (Math.floor(Math.random() * 2) == 0);

      this.title1.textContent = articlePair.title;
      this.title2.textContent = articlePair.title;

      if (article1real) {
        this.content1.textContent = articlePair.real;
        this.article1.dataset.type = "real";
        
        this.content2.textContent = articlePair.fake;
        this.article2.dataset.type = "fake";
        this.article2.dataset.ainame = articlePair.generatedby;
      } else {
        this.content2.textContent = articlePair.real;
        this.article2.dataset.type = "real";

        this.content1.textContent = articlePair.fake;
        this.article1.dataset.type = "fake";
        this.article1.dataset.ainame = articlePair.generatedby;
      }

      this.sourceAlertLink.href = articlePair.source;
      this.sourceAlertLink.textContent = articlePair.source;

      this.nextBtn.disabled = true;
    }

    /**
     * Runs when an article is selected (not confirmed)
     * @param {HTMLElement} selected Selected article
     */
    selectArticle(selected) {
      // when you click an article (not confirm)
      selected.classList.add("game-selected");
      if (selected === this.article1) {
        this.article2.classList.remove("game-selected");
      } else {
        this.article1.classList.remove("game-selected");
      }

      // enable the confirm button
      this.confirmBtn.disabled = false;
    }

    /**
     * Runs when an article is confirmed
     */
    confirmArticle() {
      // get the selected article
      let selectedElem = document.querySelector('.game-selected');
      let type = selectedElem.dataset.type;

      this.game.selectArticle(type);

      if (type === "real") {
        this.realAlert.classList.remove("d-none");
        this.fakeAlert.classList.add("d-none");
      } else {
        this.realAlert.classList.add("d-none");
        this.fakeAlert.classList.remove("d-none");

        let ainame = selectedElem.dataset.ainame;
        this.fakeAlertAiName.textContent = ainame;
      }
      this.sourceAlert.classList.remove("d-none");

      // hide confirm button and enable next button
      this.confirmBtn.classList.add("d-none");
      this.confirmBtn.disabled = true;
      this.nextBtn.classList.remove("d-none");
      this.nextBtn.disabled = false;

      // update stats
      this.updateStats()
    }

    /**
     * Update the statistics display with latest game stats
     */
    updateStats() {
      this.correct.forEach(elem => elem.textContent = this.game.pass);
      this.incorrect.forEach(elem => elem.textContent = this.game.fail);
      this.total.forEach(elem => elem.textContent = this.game.rounds + "/" + this.game.maxRounds);
      this.accuracy.forEach(elem => elem.textContent = +(((this.game.pass / this.game.rounds) || 0) * 100).toFixed(2));
    }
  }
})();