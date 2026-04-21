$(document).ready(function () {
  setTimeout(function () {
    $('#page-loader').addClass('hide');
  }, 1600);

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 60) {
      $('#navbar').addClass('scrolled');
    } else {
      $('#navbar').removeClass('scrolled');
    }
  });

  function revealVisibleElements() {
    $('.reveal').each(function () {
      var elementTopInViewport = $(this)[0].getBoundingClientRect().top;
      if (elementTopInViewport < window.innerHeight - 60) {
        $(this).addClass('visible');
      }
    });
  }

  $(window).on('scroll', revealVisibleElements);
  revealVisibleElements();

  function simulateAsyncData(data, callback, delayMs) {
    setTimeout(function () {
      callback(data);
    }, delayMs || 400);
  }

  function showToastMessage(message) {
    $('#toast').text(message).addClass('show');
    setTimeout(function () {
      $('#toast').removeClass('show');
    }, 2800);
  }

  var ADMIN_PASSWORD = 'titanadmin';

  var APP_STORAGE_KEYS = {
    uiState:      'titan.uiState',
    regDraft:     'titan.regDraft',
    applications: 'titan.applications',
    playersData: 'titan.playersData',
    coachesData: 'titan.coachesData',
    scheduleData: 'titan.scheduleData',
    pendingApplications: 'titan.pendingApplications',
    apiCache: 'titan.apiCache'
  };

  function readJsonStorage(key, fallbackValue) {
    try {
      var rawValue = localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (e) {
      return fallbackValue;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
    }
  }

  function removeStorageItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
    }
  }

  function readCollection(key, fallbackCollection) {
    var stored = readJsonStorage(key, null);
    return Array.isArray(stored) && stored.length ? stored : fallbackCollection;
  }

  playersData = readCollection(APP_STORAGE_KEYS.playersData, playersData);
  coachesData = readCollection(APP_STORAGE_KEYS.coachesData, coachesData);
  scheduleData = readCollection(APP_STORAGE_KEYS.scheduleData, scheduleData);

  var API_SETTINGS = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
      applications: '/posts'
    }
  };

  function sendApiRequest(options) {
    return $.ajax($.extend({
      timeout: 10000,
      dataType: 'json'
    }, options));
  }

  function cacheApiResponse(cacheKey, payload) {
    var cache = readJsonStorage(APP_STORAGE_KEYS.apiCache, {});
    cache[cacheKey] = {
      savedAt: new Date().toISOString(),
      payload: payload
    };
    writeJsonStorage(APP_STORAGE_KEYS.apiCache, cache);
  }

  function queuePendingApplication(formPayload) {
    var pending = readJsonStorage(APP_STORAGE_KEYS.pendingApplications, []);
    pending.push($.extend({}, formPayload, { queuedAt: new Date().toISOString() }));
    writeJsonStorage(APP_STORAGE_KEYS.pendingApplications, pending);
  }

  function syncPendingApplications() {
    var pending = readJsonStorage(APP_STORAGE_KEYS.pendingApplications, []);
    if (!pending.length || navigator.onLine === false) return;

    var failedToSync = [];
    var requests = $.map(pending, function (item) {
      return sendApiRequest({
        url: API_SETTINGS.baseUrl + API_SETTINGS.endpoints.applications,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(item)
      }).fail(function () {
        failedToSync.push(item);
      });
    });

    $.when.apply($, requests).always(function () {
      writeJsonStorage(APP_STORAGE_KEYS.pendingApplications, failedToSync);
    });
  }

  var $programsGrid = $('#programs-grid');
  var $playersGrid = $('#players-grid');
  var $loadMoreBtn = $('#load-more-btn');
  var $coachesGrid = $('#coaches-grid');
  var $scheduleList = $('#schedule-list');

  simulateAsyncData(programsData, function (data) {
    var html = '';

    $.each(data, function (index, program) {
      html += '<div class="program-card reveal" data-prog="' + index + '">'
            +   '<span class="program-icon">' + program.icon  + '</span>'
            +   '<h3>'                         + program.title + '</h3>'
            +   '<p>'                          + program.desc  + '</p>'
            +   '<span class="program-age">'   + program.ages  + '</span>'
            + '</div>';
    });

    $programsGrid.html(html);
    revealVisibleElements();
  }, 300);

  var persistedUiState = readJsonStorage(APP_STORAGE_KEYS.uiState, {});
  var selectedPositionFilter = persistedUiState.currentFilter || 'All';
  var playerSearchQuery = persistedUiState.searchQuery || '';
  var playerSortKey = persistedUiState.sortBy || 'name';
  var visiblePlayerCount = Number.isFinite(persistedUiState.visibleCount)
    ? persistedUiState.visibleCount
    : 8;

  function persistPlayersUiState() {
    writeJsonStorage(APP_STORAGE_KEYS.uiState, {
      currentFilter: selectedPositionFilter,
      searchQuery: playerSearchQuery,
      sortBy: playerSortKey,
      visibleCount: visiblePlayerCount
    });
  }

  function renderPlayers() {
    var filteredPlayers = (selectedPositionFilter === 'All')
      ? playersData
      : $.grep(playersData, function (player) {
          return player.pos === selectedPositionFilter;
        });

    if (playerSearchQuery) {
      var normalizedSearch = playerSearchQuery.toLowerCase();
      filteredPlayers = $.grep(filteredPlayers, function (player) {
        return String(player.name || '').toLowerCase().indexOf(normalizedSearch) !== -1;
      });
    }

    filteredPlayers = filteredPlayers.slice().sort(function (a, b) {
      if (playerSortKey === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''));
      }

      var aMetric = Number(a[playerSortKey]) || 0;
      var bMetric = Number(b[playerSortKey]) || 0;
      return bMetric - aMetric;
    });

    var visiblePlayers = filteredPlayers.slice(0, visiblePlayerCount);
    var playersHtml = '';

    $.each(visiblePlayers, function (i, player) {
      playersHtml += '<div class="player-card reveal">'
                  +   '<div class="player-img">'
                  +     player.emoji
                  +     '<span class="player-num">' + player.num + '</span>'
                  +   '</div>'
                  +   '<div class="player-info">'
                  +     '<h4>'                        + player.name    + '</h4>'
                  +     '<div class="player-pos">'    + player.pos     + '</div>'
                  +     '<div class="player-stats-row">'
                  +       '<div class="ps"><span class="ps-val">' + player.goals   + '</span><span class="ps-key">Goals</span></div>'
                  +       '<div class="ps"><span class="ps-val">' + player.assists + '</span><span class="ps-key">Assists</span></div>'
                  +       '<div class="ps"><span class="ps-val">' + player.apps    + '</span><span class="ps-key">Apps</span></div>'
                  +     '</div>'
                  +   '</div>'
                  + '</div>';
    });

    simulateAsyncData(playersHtml, function (renderedHtml) {
      $playersGrid.html(renderedHtml);
      revealVisibleElements();
      $loadMoreBtn.toggle(visiblePlayerCount < filteredPlayers.length);
    }, 200);
  }

  $('#player-search').val(playerSearchQuery);
  $('#player-sort').val(playerSortKey);

  $('.filter-btn').removeClass('active');
  var $activeFilter = $('#filter-tabs .filter-btn').filter(function () {
    return $(this).data('pos') === selectedPositionFilter;
  }).first();

  if ($activeFilter.length) {
    $activeFilter.addClass('active');
  } else {
    selectedPositionFilter = 'All';
    $('#filter-tabs .filter-btn[data-pos="All"]').addClass('active');
  }

  renderPlayers();

  $('#filter-tabs').on('click', '.filter-btn', function () {
    selectedPositionFilter = $(this).data('pos');
    visiblePlayerCount  = 8;
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    persistPlayersUiState();
    renderPlayers();
  });

  $('#load-more-btn').on('click', function () {
    visiblePlayerCount += 4;
    persistPlayersUiState();
    renderPlayers();
    showToastMessage('Loading more players...');
  });

  $('#player-search').on('input', function () {
    playerSearchQuery = $(this).val().trim();
    visiblePlayerCount = 8;
    persistPlayersUiState();
    renderPlayers();
  });

  $('#player-sort').on('change', function () {
    playerSortKey = $(this).val();
    persistPlayersUiState();
    renderPlayers();
  });

  simulateAsyncData(coachesData, function (data) {
    var html = '';

    $.each(data, function (i, coach) {
      html += '<div class="coach-card reveal">'
            +   '<div class="coach-photo">' + coach.emoji + '</div>'
            +   '<div class="coach-info">'
            +     '<h3>'                     + coach.name + '</h3>'
            +     '<div class="coach-role">' + coach.role + '</div>'
            +     '<p class="coach-bio">'    + coach.bio  + '</p>'
            +   '</div>'
            + '</div>';
    });

    $coachesGrid.html(html);
    revealVisibleElements();
  }, 500);

  simulateAsyncData(scheduleData, function (data) {
    var html = '';

    $.each(data, function (i, event) {
      var tagClass = 'tag-' + event.type;
      var tagLabel = event.type.charAt(0).toUpperCase() + event.type.slice(1);

      html += '<div class="schedule-item reveal">'
            +   '<div class="sched-day">'
            +     '<div class="day">'   + event.day   + '</div>'
            +     '<div class="month">' + event.month + '</div>'
            +   '</div>'
            +   '<div class="sched-divider"></div>'
            +   '<div class="sched-info">'
            +     '<h4>' + event.title  + '</h4>'
            +     '<p>'  + event.detail + '</p>'
            +   '</div>'
            +   '<span class="sched-tag ' + tagClass + '">' + tagLabel + '</span>'
            + '</div>';
    });

    $scheduleList.html(html);
    revealVisibleElements();
  }, 600);

  $(document).on('click', '.program-card', function () {
    var index   = $(this).data('prog');
    var program = programsData[index];

    var html = '<div class="section-label">Program Details</div>'
             + '<h3 style="font-family:\'Barlow Condensed\',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;color:#fff;margin:8px 0 6px">'
             +   program.icon + ' ' + program.title
             + '</h3>'
             + '<span class="program-age" style="margin-bottom:18px;display:inline-block">' + program.ages + '</span>'
             + '<p style="color:var(--text);line-height:1.8;margin-bottom:28px">' + program.desc + '</p>'
             + '<button class="btn-primary" id="modal-register-btn">Register Interest</button>';

    $('#modal-content').html(html);
    $('#programModal').addClass('open');
  });

  $('#modalClose').on('click', function () {
    $('#programModal').removeClass('open');
  });

  $('#programModal').on('click', function (e) {
    if ($(e.target).is('#programModal')) {
      $(this).removeClass('open');
    }
  });

  $(document).on('click', '#modal-register-btn', function () {
    $('#programModal').removeClass('open');
    $('html, body').animate({
      scrollTop: $('#schedule').offset().top - 80
    }, 600);
  });

  $('#submit-reg').on('click', function () {
    var name  = $('#reg-name').val().trim();
    var email = $('#reg-email').val().trim();
    var dob   = $('#reg-dob').val();
    var pos   = $('#reg-pos').val();
    var prog  = $('#reg-prog').val();
    var formPayload = { name: name, email: email, dob: dob, pos: pos, prog: prog };

    if (!name || !email || !dob || !pos || !prog) {
      $('#form-msg')
        .removeClass('success').addClass('error')
        .text('⚠ Please fill in all fields.')
        .show();
      return;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#form-msg')
        .removeClass('success').addClass('error')
        .text('⚠ Please enter a valid email address.')
        .show();
      return;
    }

    var $btn = $(this).text('Sending…').prop('disabled', true);

    sendApiRequest({
      url: API_SETTINGS.baseUrl + API_SETTINGS.endpoints.applications,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formPayload)
    }).done(function (response) {
      cacheApiResponse('lastApplicationResponse', response);
      onSubmitSuccess($btn, formPayload, false);
    }).fail(function () {
      queuePendingApplication(formPayload);
      onSubmitSuccess($btn, formPayload, true);
    });
  });

  function onSubmitSuccess($btn, formPayload, wasQueued) {
    var savedApplications = readJsonStorage(APP_STORAGE_KEYS.applications, []);
    savedApplications.push($.extend({}, formPayload, {
      submittedAt: new Date().toISOString(),
      status: wasQueued ? 'queued' : 'sent'
    }));
    writeJsonStorage(APP_STORAGE_KEYS.applications, savedApplications);

    $('#form-msg')
      .removeClass('error').addClass('success')
      .text(wasQueued
        ? "✓ Saved locally. We'll send your application when connection returns."
        : "✓ Application received! We'll contact you within 48 hours.")
      .show();

    $btn.text('Submit Application').prop('disabled', false);

    $('#reg-name, #reg-email, #reg-dob').val('');
    $('#reg-pos, #reg-prog').val('');
    removeStorageItem(APP_STORAGE_KEYS.regDraft);

    showToastMessage(wasQueued ? 'Saved offline. Sync pending.' : 'Application submitted successfully!');
  }

  var regDraft = readJsonStorage(APP_STORAGE_KEYS.regDraft, {});
  if (regDraft.name)  { $('#reg-name').val(regDraft.name); }
  if (regDraft.email) { $('#reg-email').val(regDraft.email); }
  if (regDraft.dob)   { $('#reg-dob').val(regDraft.dob); }
  if (regDraft.pos)   { $('#reg-pos').val(regDraft.pos); }
  if (regDraft.prog)  { $('#reg-prog').val(regDraft.prog); }

  $('#reg-name, #reg-email, #reg-dob, #reg-pos, #reg-prog').on('input change', function () {
    writeJsonStorage(APP_STORAGE_KEYS.regDraft, {
      name:  $('#reg-name').val().trim(),
      email: $('#reg-email').val().trim(),
      dob:   $('#reg-dob').val(),
      pos:   $('#reg-pos').val(),
      prog:  $('#reg-prog').val()
    });
  });

  $('#hero-apply-btn').on('click', function () {
    $('html, body').animate({ scrollTop: $('#schedule').offset().top - 80 }, 600);
  });

  $('#hero-programs-btn').on('click', function () {
    $('html, body').animate({ scrollTop: $('#programs').offset().top - 80 }, 600);
  });

  $('#admin-link').on('click', function (e) {
    e.preventDefault();
    var entered = window.prompt('Enter admin password');

    if (entered === null) return;

    if (entered === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem('titan.adminAccess', 'granted');
      } catch (err) {
      }
      window.location.href = 'admin.html';
      return;
    }

    showToastMessage('Wrong admin password');
  });

  syncPendingApplications();

  function animateCounters() {
    $('.stat-num').each(function () {
      var $el = $(this);

      if ($el.data('done')) return;

      var fullText = $el.text();
      var num      = parseInt(fullText.replace(/\D/g, ''), 10);
      var suffix   = fullText.replace(/\d/g, '');

      $el.data('done', true);

      $({ n: 0 }).animate({ n: num }, {
        duration: 1800,
        easing:   'swing',
        step: function () {
          $el.html(Math.floor(this.n) + '<span>' + suffix + '</span>');
        },
        complete: function () {
          $el.html(num + '<span>' + suffix + '</span>');
        }
      });
    });
  }

  var countersDone = false;

  $(window).on('scroll', function () {
    if (!countersDone) {
      var heroBottom = $('#hero').offset().top + $('#hero').outerHeight();
      if ($(this).scrollTop() > heroBottom - 200) {
        animateCounters();
        countersDone = true;
      }
    }
  });

});
