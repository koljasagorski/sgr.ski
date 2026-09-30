/* Workshop-Selbstcheck. Antworten leben ausschließlich im Arbeitsspeicher.
   Keine Speicherung, Analytics-Events oder Übertragung der Antworten. */
(function () {
  'use strict';

  var quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;

  var questions = [
    {
      topic: 'Bedrohungen',
      question: 'Wisst ihr, welche Informationen ihr vor wem schützen müsst?',
      hint: 'Zum Beispiel Quellen, Kundendaten, interne Dokumente oder private Kontaktdaten.',
      answers: ['Ja. Wir haben konkrete Risiken besprochen und passende Schutzmaßnahmen vereinbart.', 'Wir kennen einige Risiken, haben aber noch keinen gemeinsamen Plan.', 'Darüber haben wir bisher kaum gesprochen.'],
      next: 'Bedrohungen: Klärt gemeinsam, welche Informationen ihr vor wem schützen müsst.'
    },
    {
      topic: 'Passwörter',
      question: 'Wie geht ihr mit Passwörtern um?',
      hint: 'Denke auch an selten genutzte Konten und gemeinsam verwaltete Zugänge.',
      answers: ['Wir nutzen für jeden Zugang ein eigenes langes Passwort aus einem Passwortmanager oder einen Passkey.', 'Wir nutzen teilweise einen Passwortmanager, verwenden aber noch manche Passwörter mehrfach.', 'Wir verwenden häufig dieselben oder leicht abgewandelte Passwörter.'],
      next: 'Passwörter: Führt einen Passwortmanager ein und ersetzt mehrfach genutzte Passwörter.'
    },
    {
      topic: 'Kontoschutz',
      question: 'Sind eure wichtigen Konten zusätzlich zum Passwort abgesichert?',
      hint: 'Besonders E-Mail, Cloud, soziale Netzwerke und Administrationskonten zählen dazu.',
      answers: ['Ja, überall wo möglich mit Passkeys oder Mehrfaktor-Authentifizierung. Wiederherstellungscodes sind sicher hinterlegt.', 'Einige Konten sind zusätzlich geschützt, andere oder ihre Wiederherstellung noch nicht.', 'Meist reicht bei uns das Passwort zum Anmelden.'],
      next: 'Kontoschutz: Sichert wichtige Konten mit Passkeys oder MFA und plant die Wiederherstellung.'
    },
    {
      topic: 'Phishing',
      question: 'Eine dringende Nachricht verlangt einen Login oder eine Zahlung. Was tut ihr?',
      hint: 'Sie scheint von der Geschäftsführung, einem Dienstleister oder einer bekannten Kontaktperson zu kommen.',
      answers: ['Wir prüfen die Anfrage über einen bereits bekannten Kontaktweg und öffnen Dienste direkt statt über den Nachrichtenlink.', 'Wir schauen auf Absender und Link. Unter Zeitdruck fehlt aber manchmal eine unabhängige Rückfrage.', 'Wenn Name und Gestaltung vertraut aussehen, folgen wir der Aufforderung.'],
      next: 'Phishing: Übt, ungewöhnliche Anfragen über einen unabhängigen, bekannten Kontaktweg zu prüfen.'
    },
    {
      topic: 'Updates',
      question: 'Wie zuverlässig haltet ihr Geräte, Browser und Apps aktuell?',
      hint: 'Auch Smartphones, Erweiterungen und selten verwendete Geräte gehören dazu.',
      answers: ['Sicherheitsupdates werden zeitnah installiert. Wir prüfen regelmäßig, ob alle Geräte noch Updates erhalten.', 'Die meisten Updates laufen automatisch, einzelne Geräte oder Apps bleiben aber länger liegen.', 'Updates verschieben wir oft. Manche Geräte oder Programme erhalten keine mehr.'],
      next: 'Updates: Klärt, wer Updates kontrolliert, und ersetzt Software ohne Sicherheitsupdates.'
    },
    {
      topic: 'Geräteschutz',
      question: 'Wie gut sind eure Daten geschützt, wenn ein Laptop oder Handy verloren geht?',
      hint: 'Entscheidend sind Gerätesperre und Verschlüsselung, auch auf mitgenommenen Datenträgern.',
      answers: ['Unsere Geräte sind verschlüsselt, mit starker PIN oder starkem Passwort gesperrt und sperren sich automatisch.', 'Eine Bildschirmsperre gibt es. Ob alle Geräte und Datenträger verschlüsselt sind, ist nicht geklärt.', 'Manche Geräte oder Datenträger mit sensiblen Daten sind unverschlüsselt oder ohne wirksame Sperre.'],
      next: 'Geräteschutz: Prüft Verschlüsselung, starke Gerätesperren und automatische Sperrzeiten.'
    },
    {
      topic: 'Backups',
      question: 'Könntet ihr wichtige Daten nach einem Ausfall oder Angriff wiederherstellen?',
      hint: 'Eine synchronisierte Cloud-Kopie allein kann auch Löschungen oder verschlüsselte Dateien übernehmen.',
      answers: ['Wir sichern regelmäßig, halten eine getrennte oder gegen Überschreiben geschützte Kopie vor und haben die Wiederherstellung getestet.', 'Es gibt Backups, aber ihre Wiederherstellung oder ihr Schutz vor einem Angriff ist nicht geprüft.', 'Wir verlassen uns auf Synchronisierung oder haben keine verlässlichen Backups.'],
      next: 'Backups: Schützt eine Sicherung vor Änderungen aus dem Alltag und testet die Wiederherstellung.'
    },
    {
      topic: 'Kommunikation',
      question: 'Wie tauscht ihr vertrauliche Informationen aus?',
      hint: 'Denke an sensible Gespräche, Dateien und den Kontakt zu Quellen oder Kunden.',
      answers: ['Wir nutzen vereinbarte, Ende-zu-Ende-verschlüsselte Wege und prüfen bei sensiblen Kontakten die Identität unabhängig.', 'Wir nutzen teilweise verschlüsselte Wege, prüfen Kontakte aber nicht systematisch.', 'Meist per normaler E-Mail, offenen Freigabelinks oder über den gerade bequemsten Kanal.'],
      next: 'Kommunikation: Vereinbart geschützte Kontaktwege und übt die Prüfung der Gesprächspartner.'
    },
    {
      topic: 'Metadaten',
      question: 'Prüft ihr Fotos und Dokumente, bevor ihr sie weitergebt oder veröffentlicht?',
      hint: 'Standortdaten, Autorennamen, Kommentare oder die Änderungshistorie können mehr verraten als der sichtbare Inhalt.',
      answers: ['Ja. Wir prüfen sensible Dateien und entfernen unnötige Metadaten, Kommentare und verborgene Inhalte aus der Weitergabe-Kopie.', 'Wir achten gelegentlich darauf, haben aber keinen festen Prüfschritt.', 'Bisher prüfen wir nur, was im Bild oder Dokument sichtbar ist.'],
      next: 'Metadaten: Macht die Prüfung von Dateien vor Veröffentlichung oder Weitergabe zum festen Schritt.'
    },
    {
      topic: 'Notfall & Team',
      question: 'Wüsste jede Person im Team, was bei einem verdächtigen Login oder verlorenen Gerät zu tun ist?',
      hint: 'Dazu gehören ein bekannter Meldeweg, klare Zuständigkeiten und erste Schritte, die ihr auch schon geübt habt.',
      answers: ['Ja. Wir haben einen erreichbaren Notfallplan, üben ihn und weisen neue Teammitglieder ein.', 'Einzelne Personen wissen Bescheid, aber der Plan ist nicht allen bekannt oder wurde noch nie geübt.', 'Wir müssten erst herausfinden, wer hilft und was zu tun ist.'],
      next: 'Notfall & Team: Legt Meldewege und erste Schritte fest und spielt einen Vorfall gemeinsam durch.'
    }
  ];
  var points = [10, 5, 0, 0];
  var answers = questions.map(function () { return null; });
  var current = 0;

  function get(name) { return quiz.querySelector('[data-quiz-' + name + ']'); }

  var intro = get('intro');
  var form = get('form');
  var result = get('result');
  var questionEl = get('question');
  var options = get('options');
  var error = quiz.querySelector('#quiz-error');

  function focusOn(el, scrollTarget) {
    el.focus({ preventScroll: true });
    var target = scrollTarget || el;
    if (target.getBoundingClientRect().top < 16 || el.getBoundingClientRect().bottom > window.innerHeight - 16) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function updateProgress() {
    get('progress').value = answers.filter(function (answer) { return answer !== null; }).length;
  }

  function showQuestion() {
    intro.hidden = true;
    result.hidden = true;
    form.hidden = false;
    var item = questions[current];
    get('step').textContent = 'Frage ' + String(current + 1).padStart(2, '0') + ' von ' + questions.length;
    get('topic').textContent = item.topic;
    questionEl.textContent = item.question;
    get('hint').textContent = item.hint;
    get('back').disabled = current === 0;
    get('next').textContent = current === questions.length - 1 ? 'Ergebnis anzeigen' : 'Nächste Frage';
    error.textContent = '';
    options.replaceChildren();

    item.answers.concat('Weiß ich nicht / kann ich nicht einschätzen.').forEach(function (text, index) {
      var label = document.createElement('label');
      label.className = 'quiz__option';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quiz-answer';
      input.value = String(index);
      input.checked = answers[current] === index;
      input.required = true;
      var description = document.createElement('span');
      description.textContent = text;
      label.append(input, description);
      options.append(label);
    });
    updateProgress();
    focusOn(questionEl, form);
  }

  function showResult() {
    var score = answers.reduce(function (sum, answer) { return sum + points[answer]; }, 0);
    var title;
    var copy;
    if (score <= 25) {
      title = 'Wir sollten dringend über deine digitale Sicherheit reden.';
      copy = 'In eurem Alltag fehlen noch mehrere grundlegende Schutzmaßnahmen. Ein Workshop hilft euch, die wichtigsten Lücken zu erkennen und die ersten Schritte gemeinsam umzusetzen.';
    } else if (score <= 50) {
      title = 'Ein Anfang ist gemacht. Jetzt braucht ihr eine gemeinsame Basis.';
      copy = 'Einige Schutzmaßnahmen sind vorhanden, andere hängen noch vom Zufall oder von einzelnen Personen ab. In einem Workshop macht ihr daraus verlässliche Routinen für das ganze Team.';
    } else if (score <= 75) {
      title = 'Ihr seid auf einem guten Weg. Ein paar Lücken bleiben.';
      copy = 'Viele Grundlagen sitzen bereits. Ein gezielter Workshop hilft euch, offene Punkte zu schließen und euer Wissen in praktischen Übungen zu testen.';
    } else if (score < 100) {
      title = 'Ihr seid gut aufgestellt. Jetzt geht es um die Details.';
      copy = 'Eure Antworten zeigen viele gute Sicherheitsroutinen. Ein vertiefendes Training zu euren offenen Themen oder eine gemeinsame Notfallübung kann euch weiterbringen.';
    } else {
      title = 'Du bist schon sehr gut unterwegs. Dein Team auch.';
      copy = 'Nach euren Antworten sind alle zehn Bereiche konsequent abgedeckt. Bleibt dran, prüft eure Routinen regelmäßig und nehmt neue Teammitglieder mit. Für den nächsten Schritt können wir konkrete Szenarien gemeinsam durchspielen.';
    }

    get('score').textContent = score + '%';
    get('points').textContent = score + ' von 100 Punkten';
    get('result-title').textContent = title;
    get('result-copy').textContent = copy;
    var priorities = questions.map(function (item, index) {
      return { text: item.next, score: points[answers[index]], order: index };
    }).filter(function (item) { return item.score < 10; })
      .sort(function (a, b) { return a.score - b.score || a.order - b.order; }).slice(0, 3);
    get('priority-list').replaceChildren();
    priorities.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item.text;
      get('priority-list').append(li);
    });
    get('priorities').hidden = priorities.length === 0;
    get('contact-copy').textContent = score === 100
      ? 'Lust auf ein vertiefendes Training für dein Team? Schreib mir.'
      : 'Lass uns besprechen, welcher Workshop zu dir und deinem Team passt.';
    // Der Mail-Link öffnet nur einen Entwurf; Antworten werden nicht beigefügt.
    get('contact').href = 'mailto:kolja@sagorski.org?subject=' + encodeURIComponent('Workshop-Anfrage: Digitale Sicherheit');
    form.hidden = true;
    result.hidden = false;
    focusOn(get('result-title'), result);
  }

  get('start').addEventListener('click', showQuestion);
  options.addEventListener('change', function (event) {
    if (!event.target.matches('input[name="quiz-answer"]')) return;
    answers[current] = Number(event.target.value);
    error.textContent = '';
    updateProgress();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (answers[current] === null) {
      error.textContent = 'Bitte wähle eine Antwort. Auch „weiß ich nicht“ ist möglich.';
      focusOn(options.querySelector('input'));
      return;
    }
    if (current < questions.length - 1) {
      current++;
      showQuestion();
    } else if (answers.every(function (answer) { return answer !== null; })) {
      showResult();
    }
  });
  get('back').addEventListener('click', function () {
    if (current > 0) { current--; showQuestion(); }
  });
  get('review').addEventListener('click', showQuestion);
  get('restart').addEventListener('click', function () {
    answers = questions.map(function () { return null; });
    current = 0;
    showQuestion();
  });

  get('fallback').hidden = true;
  get('start').hidden = false;
})();
