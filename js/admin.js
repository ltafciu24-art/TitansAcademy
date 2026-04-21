$(document).ready(function () {
  if (sessionStorage.getItem('titan.adminAccess') !== 'granted') {
    window.location.href = 'index.html';
    return;
  }

  var STORAGE_KEYS = {
    applications: 'titan.applications',
    playersData: 'titan.playersData',
    coachesData: 'titan.coachesData',
    scheduleData: 'titan.scheduleData',
    pendingApplications: 'titan.pendingApplications'
  };

  function readStorage(key, fallbackValue) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (e) {
      return fallbackValue;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  var defaultPlayers = clone(playersData);
  var defaultCoaches = clone(coachesData);
  var defaultSchedule = clone(scheduleData);

  var players = readStorage(STORAGE_KEYS.playersData, clone(defaultPlayers));
  var coaches = readStorage(STORAGE_KEYS.coachesData, clone(defaultCoaches));
  var schedule = readStorage(STORAGE_KEYS.scheduleData, clone(defaultSchedule));

  if (!Array.isArray(players)) players = clone(defaultPlayers);
  if (!Array.isArray(coaches)) coaches = clone(defaultCoaches);
  if (!Array.isArray(schedule)) schedule = clone(defaultSchedule);

  function savePlayers() { writeStorage(STORAGE_KEYS.playersData, players); }
  function saveCoaches() { writeStorage(STORAGE_KEYS.coachesData, coaches); }
  function saveSchedule() { writeStorage(STORAGE_KEYS.scheduleData, schedule); }

  function clearForm(prefix) {
    var formIdByPrefix = {
      player: '#players-form',
      coach: '#coaches-form',
      schedule: '#schedule-form'
    };
    var formSelector = formIdByPrefix[prefix] || ('#' + prefix + '-form');
    var formElement = $(formSelector)[0];

    $('#' + prefix + '-index').val('');
    if (formElement) {
      formElement.reset();
    }
  }

  function renderPlayers() {
    var html = '';
    $.each(players, function (idx, item) {
      html += '<tr>'
        + '<td>' + item.emoji + ' ' + item.name + '</td>'
        + '<td>' + item.pos + '</td>'
        + '<td>' + item.num + '</td>'
        + '<td>' + item.goals + '</td>'
        + '<td>' + item.assists + '</td>'
        + '<td>' + item.apps + '</td>'
        + '<td>'
        + '<button class="btn btn-sm btn-primary me-2" data-edit-player="' + idx + '">Edit</button>'
        + '<button class="btn btn-sm btn-danger" data-delete-player="' + idx + '">Delete</button>'
        + '</td>'
        + '</tr>';
    });

    $('#players-table tbody').html(html || '<tr><td colspan="7" class="text-center text-secondary">No players</td></tr>');
  }

  function renderCoaches() {
    var html = '';
    $.each(coaches, function (idx, item) {
      html += '<tr>'
        + '<td>' + item.emoji + ' ' + item.name + '</td>'
        + '<td>' + item.role + '</td>'
        + '<td>' + item.bio + '</td>'
        + '<td>'
        + '<button class="btn btn-sm btn-primary me-2" data-edit-coach="' + idx + '">Edit</button>'
        + '<button class="btn btn-sm btn-danger" data-delete-coach="' + idx + '">Delete</button>'
        + '</td>'
        + '</tr>';
    });

    $('#coaches-table tbody').html(html || '<tr><td colspan="4" class="text-center text-secondary">No coaches</td></tr>');
  }

  function renderSchedule() {
    var html = '';
    $.each(schedule, function (idx, item) {
      html += '<tr>'
        + '<td>' + item.day + ' ' + item.month + '</td>'
        + '<td>' + item.title + '</td>'
        + '<td>' + item.detail + '</td>'
        + '<td>' + item.type + '</td>'
        + '<td>'
        + '<button class="btn btn-sm btn-primary me-2" data-edit-schedule="' + idx + '">Edit</button>'
        + '<button class="btn btn-sm btn-danger" data-delete-schedule="' + idx + '">Delete</button>'
        + '</td>'
        + '</tr>';
    });

    $('#schedule-table tbody').html(html || '<tr><td colspan="5" class="text-center text-secondary">No events</td></tr>');
  }

  function renderApplications() {
    var applications = readStorage(STORAGE_KEYS.applications, []);
    var pending = readStorage(STORAGE_KEYS.pendingApplications, []);
    var html = '';

    $.each(applications, function (_, item) {
      html += '<tr>'
        + '<td>' + (item.name || '-') + '</td>'
        + '<td>' + (item.email || '-') + '</td>'
        + '<td>' + (item.prog || '-') + '</td>'
        + '<td><span class="badge ' + ((item.status === 'queued') ? 'text-bg-warning' : 'text-bg-success') + '">' + (item.status || 'sent') + '</span></td>'
        + '<td>' + (item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-') + '</td>'
        + '</tr>';
    });

    $('#applications-table tbody').html(html || '<tr><td colspan="5" class="text-center text-secondary">No applications yet</td></tr>');
    $('#pending-summary').text(pending.length
      ? pending.length + ' pending application(s) waiting for sync.'
      : 'No pending sync items.');
  }

  $('#players-form').on('submit', function (e) {
    e.preventDefault();
    var idx = $('#player-index').val();
    var payload = {
      name: $('#player-name').val().trim(),
      pos: $('#player-pos').val(),
      emoji: $('#player-emoji').val().trim(),
      num: Number($('#player-num').val()),
      goals: Number($('#player-goals').val()),
      assists: Number($('#player-assists').val()),
      apps: Number($('#player-apps').val())
    };

    if (idx === '') players.push(payload);
    else players[Number(idx)] = payload;

    savePlayers();
    clearForm('player');
    renderPlayers();
  });

  $(document).on('click', '[data-edit-player]', function () {
    var idx = Number($(this).attr('data-edit-player'));
    var item = players[idx];
    $('#player-index').val(idx);
    $('#player-name').val(item.name);
    $('#player-pos').val(item.pos);
    $('#player-emoji').val(item.emoji);
    $('#player-num').val(item.num);
    $('#player-goals').val(item.goals);
    $('#player-assists').val(item.assists);
    $('#player-apps').val(item.apps);
  });

  $(document).on('click', '[data-delete-player]', function () {
    var idx = Number($(this).attr('data-delete-player'));
    var playerName = players[idx] && players[idx].name ? players[idx].name : 'this player';
    var shouldDelete = window.confirm('Are you sure you want to delete ' + playerName + '?');

    if (!shouldDelete) {
      return;
    }

    players.splice(idx, 1);
    savePlayers();
    renderPlayers();
  });

  $('#cancel-player').on('click', function () {
    clearForm('player');
  });

  $('#coaches-form').on('submit', function (e) {
    e.preventDefault();
    var idx = $('#coach-index').val();
    var payload = {
      name: $('#coach-name').val().trim(),
      role: $('#coach-role').val().trim(),
      emoji: $('#coach-emoji').val().trim(),
      bio: $('#coach-bio').val().trim()
    };

    if (idx === '') coaches.push(payload);
    else coaches[Number(idx)] = payload;

    saveCoaches();
    clearForm('coach');
    renderCoaches();
  });

  $(document).on('click', '[data-edit-coach]', function () {
    var idx = Number($(this).attr('data-edit-coach'));
    var item = coaches[idx];
    $('#coach-index').val(idx);
    $('#coach-name').val(item.name);
    $('#coach-role').val(item.role);
    $('#coach-emoji').val(item.emoji);
    $('#coach-bio').val(item.bio);
  });

  $(document).on('click', '[data-delete-coach]', function () {
    var idx = Number($(this).attr('data-delete-coach'));
    coaches.splice(idx, 1);
    saveCoaches();
    renderCoaches();
  });

  $('#cancel-coach').on('click', function () {
    clearForm('coach');
  });

  $('#schedule-form').on('submit', function (e) {
    e.preventDefault();
    var idx = $('#schedule-index').val();
    var payload = {
      day: $('#schedule-day').val().trim(),
      month: $('#schedule-month').val().trim(),
      title: $('#schedule-title').val().trim(),
      detail: $('#schedule-detail').val().trim(),
      type: $('#schedule-type').val()
    };

    if (idx === '') schedule.push(payload);
    else schedule[Number(idx)] = payload;

    saveSchedule();
    clearForm('schedule');
    renderSchedule();
  });

  $(document).on('click', '[data-edit-schedule]', function () {
    var idx = Number($(this).attr('data-edit-schedule'));
    var item = schedule[idx];
    $('#schedule-index').val(idx);
    $('#schedule-day').val(item.day);
    $('#schedule-month').val(item.month);
    $('#schedule-title').val(item.title);
    $('#schedule-detail').val(item.detail);
    $('#schedule-type').val(item.type);
  });

  $(document).on('click', '[data-delete-schedule]', function () {
    var idx = Number($(this).attr('data-delete-schedule'));
    schedule.splice(idx, 1);
    saveSchedule();
    renderSchedule();
  });

  $('#cancel-schedule').on('click', function () {
    clearForm('schedule');
  });

  $('#reset-players').on('click', function () {
    players = clone(defaultPlayers);
    savePlayers();
    clearForm('player');
    renderPlayers();
  });

  $('#reset-coaches').on('click', function () {
    coaches = clone(defaultCoaches);
    saveCoaches();
    clearForm('coach');
    renderCoaches();
  });

  $('#reset-schedule').on('click', function () {
    schedule = clone(defaultSchedule);
    saveSchedule();
    clearForm('schedule');
    renderSchedule();
  });

  $('#clear-applications').on('click', function () {
    writeStorage(STORAGE_KEYS.applications, []);
    writeStorage(STORAGE_KEYS.pendingApplications, []);
    renderApplications();
  });

  $('#admin-logout').on('click', function () {
    sessionStorage.removeItem('titan.adminAccess');
    window.location.href = 'index.html';
  });

  renderPlayers();
  renderCoaches();
  renderSchedule();
  renderApplications();
});
