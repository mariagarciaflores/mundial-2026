/* ============================================================
   Mundial 2026 — Calendario, resultados en vivo y plantillas
   Datos: TheSportsDB (partidos/resultados) + Wikipedia (jugadores)
   ============================================================ */

const API = 'https://www.thesportsdb.com/api/v1/json/123';
const LEAGUE_ID = 4429;
const SEASON = '2026';
const GROUP_ROUNDS = [1, 2, 3];
const KO_ROUNDS = [32, 16, 125, 150, 160, 200];
const KO_START = '2026-06-26'; // no consultamos eliminatorias antes de esta fecha
const TOURNAMENT_START = '2026-06-11';
const TOURNAMENT_END = '2026-07-19';
const REFRESH_MS = 60000;

const KO_LABELS = {
  32: { es: 'Dieciseisavos de final', en: 'Round of 32' },
  16: { es: 'Octavos de final', en: 'Round of 16' },
  125: { es: 'Cuartos de final', en: 'Quarter-finals' },
  150: { es: 'Semifinales', en: 'Semi-finals' },
  160: { es: 'Tercer puesto', en: 'Third place play-off' },
  200: { es: 'Final', en: 'Final' },
};

const I18N = {
  es: {
    title: 'Mundial 2026', subtitle: 'Canadá · México · Estados Unidos',
    tabMatches: 'Partidos', tabGroups: 'Grupos', tabKnockout: 'Eliminatorias', tabTeams: 'Equipos',
    tzLabel: 'Horarios en:', live: 'EN VIVO', updated: 'Actualizado', today: 'Hoy',
    matchesOf: 'Partidos del', noMatches: 'No hay partidos este día.',
    group: 'Grupo', venue: 'Estadio', statusNS: 'POR JUGAR', statusFT: 'FINAL',
    statusHT: 'DESCANSO', statusLive: 'EN VIVO', statusPST: 'APLAZADO', statusET: 'PRÓRROGA', statusPEN: 'PENALES',
    standingsLegend1: 'Clasificado a dieciseisavos (1.º y 2.º)', standingsLegend2: 'Posible clasificación (mejores terceros)',
    bestThirds: 'Mejores terceros (clasifican los 8 mejores)',
    koEmpty: 'Las eliminatorias comienzan el 28 de junio. Los cruces aparecerán aquí automáticamente cuando termine la fase de grupos.',
    players: 'jugadores', back: '← Volver', age: 'años', caps: 'Partidos', goals: 'Goles', number: 'Dorsal',
    born: 'Nacimiento', nationality: 'Nacionalidad', club: 'Club', position: 'Posición',
    bioLoading: 'Cargando biografía…', bioError: 'No se pudo cargar la biografía.', readWiki: 'Leer más en Wikipedia →',
    posGK: 'Porteros', posDF: 'Defensas', posMF: 'Centrocampistas', posFW: 'Delanteros',
    pGK: 'Portero', pDF: 'Defensa', pMF: 'Centrocampista', pFW: 'Delantero',
    offline: 'Sin conexión con el servidor de resultados; mostrando el último calendario guardado.',
    footer: 'Datos: TheSportsDB y Wikipedia · Actualización automática cada 60 segundos · Hecho con ❤️ para el Mundial 2026',
    footerRepo: 'Código en GitHub',
    thTeam: 'Equipo', winner: 'Ganador',
    tzLocal: 'Tu hora local', tzAddPlaceholder: '+ Añadir país…',
    tabLearn: '🎓 Aprende',
    detailHint: 'Toca para ver goles y tarjetas →',
    tlTitle: 'Minuto a minuto', tlEmpty: 'Aún no hay incidencias registradas para este partido.',
    tlNotStarted: 'El partido todavía no comienza. Aquí aparecerán los goles, tarjetas y penales cuando se juegue.',
    evGoal: 'Gol', evGoalHeader: 'Gol de cabeza', evGoalFK: 'Gol de tiro libre', evGoalVolley: 'Gol de volea',
    evPenScored: 'Gol de penal', evPenMissed: 'Penal fallado', evOwnGoal: 'Gol en propia puerta',
    evYellow: 'Tarjeta amarilla', evRed: 'Tarjeta roja',
    expYellow: 'Es una advertencia del árbitro: normalmente por una falta dura, protestar demasiado o perder tiempo. ¡Ojo! Si este jugador recibe otra amarilla en el mismo partido, se convierte en roja y queda expulsado.',
    expRed: 'Expulsión inmediata: el jugador debe abandonar la cancha, no puede ser reemplazado (su equipo juega con un jugador menos el resto del partido) y se perderá como mínimo el siguiente partido. Se saca por faltas violentas, agresiones o por evitar un gol claro con la mano o con falta.',
    expPenScored: 'Hubo una falta o una mano DENTRO del área, así que el árbitro concedió un penal: un tiro directo desde los 11 metros donde solo defiende el portero. Este fue convertido en gol.',
    expPenMissed: 'Hubo una falta o una mano DENTRO del área y el árbitro concedió un penal (tiro desde los 11 metros, solo defiende el portero), pero el jugador no logró marcar.',
    expOwnGoal: 'El jugador metió el balón en su propia portería sin querer. El gol cuenta para el equipo rival.',
    expET: '⏱️ Este partido se fue a la prórroga (alargue): como había empate al final de los 90 minutos, se jugaron 2 tiempos extra de 15 minutos cada uno.',
    expShootout: '⚪ Tanda de penales: como el empate siguió tras la prórroga, cada equipo pateó penales por turnos para decidir al ganador.',
    shootoutLabel: 'Penales',
    eduBanner: '¿Nueva en el fútbol? En la pestaña <b>🎓 Aprende</b> te explicamos las reglas, las tarjetas y los penales de forma súper sencilla.',
    goLearn: 'Ir a Aprende',
    groupsExplainerTitle: '🎓 ¿Cómo funciona la clasificación? (explicación sencilla)',
    groupsExplainerBody: `<p>Cada equipo juega <b>3 partidos</b> contra los otros de su grupo, y gana puntos así:</p>
      <ul><li>🏆 <b>Ganar = 3 puntos</b></li><li>🤝 <b>Empatar = 1 punto</b></li><li>😢 <b>Perder = 0 puntos</b></li></ul>
      <p>La tabla se ordena por <b>Pts</b> (puntos). Si hay empate a puntos, gana quien tenga mejor <b>DG</b> (diferencia de goles: los goles que metiste menos los que te metieron) y luego más <b>GF</b> (goles a favor).</p>
      <p>¿Quién avanza a las eliminatorias? El <b>1.º y el 2.º de cada grupo</b> (franja verde) más los <b>8 mejores terceros</b> de todos los grupos (franja amarilla). En total 32 equipos siguen y 16 se despiden.</p>
      <p><b>Columnas:</b> PJ = partidos jugados · G = ganados · E = empatados · P = perdidos · GF = goles a favor · GC = goles en contra · DG = diferencia · Pts = puntos.</p>`,
    koExplainerTitle: '🎓 ¿Cómo funcionan las eliminatorias? (explicación sencilla)',
    koExplainerBody: `<p>Se acabaron los grupos: ahora es <b>a partido único</b>. El que gana avanza y el que pierde se va a casa. 🏠</p>
      <p>¿Y si empatan? Se juega la <b>prórroga</b> (alargue): 2 tiempos extra de 15 minutos. ¿Siguen empatados? <b>Tanda de penales</b>: 5 disparos por equipo desde los 11 metros, y si persiste el empate, se patea de uno en uno hasta que alguien falle (muerte súbita).</p>
      <p>El camino: Dieciseisavos (32 equipos) → Octavos (16) → Cuartos (8) → Semifinales (4) → <b>la Final</b> 🏆 (los perdedores de las semis juegan por el tercer puesto).</p>`,
    learnIntro: '¿Primera vez siguiendo un Mundial? ¡Bienvenida! ⚽ Aquí te explicamos todo lo que necesitas para disfrutar cada partido, sin palabras raras. Toca cada tarjeta para abrirla.',
    installApp: 'Instalar app',
    iosHint: '📲 Para instalar esta app en tu iPhone/iPad: toca el botón <b>Compartir</b> <small>(el cuadrado con flecha)</small> y elige <b>"Añadir a pantalla de inicio"</b>.',
  },
  en: {
    title: 'World Cup 2026', subtitle: 'Canada · Mexico · United States',
    tabMatches: 'Matches', tabGroups: 'Groups', tabKnockout: 'Knockout', tabTeams: 'Teams',
    tzLabel: 'Times in:', live: 'LIVE', updated: 'Updated', today: 'Today',
    matchesOf: 'Matches on', noMatches: 'No matches on this day.',
    group: 'Group', venue: 'Venue', statusNS: 'UPCOMING', statusFT: 'FULL TIME',
    statusHT: 'HALF TIME', statusLive: 'LIVE', statusPST: 'POSTPONED', statusET: 'EXTRA TIME', statusPEN: 'PENALTIES',
    standingsLegend1: 'Qualified for round of 32 (1st & 2nd)', standingsLegend2: 'Possible qualification (best thirds)',
    bestThirds: 'Best third-placed teams (top 8 qualify)',
    koEmpty: 'The knockout stage starts on June 28. Fixtures will appear here automatically once the group stage ends.',
    players: 'players', back: '← Back', age: 'years old', caps: 'Caps', goals: 'Goals', number: 'Number',
    born: 'Born', nationality: 'Nationality', club: 'Club', position: 'Position',
    bioLoading: 'Loading biography…', bioError: 'Could not load biography.', readWiki: 'Read more on Wikipedia →',
    posGK: 'Goalkeepers', posDF: 'Defenders', posMF: 'Midfielders', posFW: 'Forwards',
    pGK: 'Goalkeeper', pDF: 'Defender', pMF: 'Midfielder', pFW: 'Forward',
    offline: 'Could not reach the live results server; showing the last saved schedule.',
    footer: 'Data: TheSportsDB & Wikipedia · Auto-refresh every 60 seconds · Made with ❤️ for the 2026 World Cup',
    footerRepo: 'Source code on GitHub',
    thTeam: 'Team', winner: 'Winner',
    tzLocal: 'Your local time', tzAddPlaceholder: '+ Add country…',
    tabLearn: '🎓 Learn',
    detailHint: 'Tap to see goals and cards →',
    tlTitle: 'Minute by minute', tlEmpty: 'No incidents recorded for this match yet.',
    tlNotStarted: 'The match has not started yet. Goals, cards and penalties will appear here once it is played.',
    evGoal: 'Goal', evGoalHeader: 'Headed goal', evGoalFK: 'Free-kick goal', evGoalVolley: 'Volley goal',
    evPenScored: 'Penalty scored', evPenMissed: 'Penalty missed', evOwnGoal: 'Own goal',
    evYellow: 'Yellow card', evRed: 'Red card',
    expYellow: "A warning from the referee: usually for a hard foul, too much protesting or time-wasting. Careful! If this player gets a second yellow in the same match, it becomes a red and they are sent off.",
    expRed: 'Immediate sending-off: the player must leave the pitch, cannot be replaced (their team plays with one player fewer for the rest of the match) and will miss at least the next game. Given for violent fouls, aggression or denying a clear goal with a hand or a foul.',
    expPenScored: 'There was a foul or a handball INSIDE the box, so the referee awarded a penalty: a direct shot from 11 metres with only the goalkeeper defending. This one was scored.',
    expPenMissed: 'There was a foul or a handball INSIDE the box and the referee awarded a penalty (a shot from 11 metres, only the goalkeeper defends), but the player failed to score.',
    expOwnGoal: 'The player accidentally put the ball into their own net. The goal counts for the opposing team.',
    expET: '⏱️ This match went to extra time: as it was level after 90 minutes, two extra periods of 15 minutes each were played.',
    expShootout: '⚪ Penalty shootout: with the tie still level after extra time, each team took penalties in turns to decide the winner.',
    shootoutLabel: 'Penalties',
    eduBanner: 'New to football? In the <b>🎓 Learn</b> tab we explain the rules, the cards and penalties in a super simple way.',
    goLearn: 'Go to Learn',
    groupsExplainerTitle: '🎓 How do the standings work? (simple explanation)',
    groupsExplainerBody: `<p>Each team plays <b>3 matches</b> against the others in its group, earning points like this:</p>
      <ul><li>🏆 <b>Win = 3 points</b></li><li>🤝 <b>Draw = 1 point</b></li><li>😢 <b>Loss = 0 points</b></li></ul>
      <p>The table is sorted by <b>Pts</b> (points). If teams are level, the better <b>GD</b> (goal difference: goals scored minus goals conceded) wins, then more <b>GF</b> (goals for).</p>
      <p>Who advances to the knockout stage? The <b>1st and 2nd of each group</b> (green stripe) plus the <b>8 best third-placed teams</b> across all groups (yellow stripe). In total, 32 teams move on and 16 go home.</p>
      <p><b>Columns:</b> PJ = played · G = won · E = drawn · P = lost · GF = goals for · GC = goals against · DG = difference · Pts = points.</p>`,
    koExplainerTitle: '🎓 How does the knockout stage work? (simple explanation)',
    koExplainerBody: `<p>Groups are over: now it is <b>single elimination</b>. The winner advances and the loser goes home. 🏠</p>
      <p>What if it is a draw? <b>Extra time</b> is played: two extra periods of 15 minutes. Still level? <b>Penalty shootout</b>: 5 kicks per team from 11 metres, and if still tied, one kick each until someone misses (sudden death).</p>
      <p>The road: Round of 32 → Round of 16 → Quarter-finals → Semi-finals → <b>the Final</b> 🏆 (the semi-final losers play for third place).</p>`,
    learnIntro: 'First time following a World Cup? Welcome! ⚽ Here we explain everything you need to enjoy every match, no jargon. Tap each card to open it.',
    installApp: 'Install app',
    iosHint: '📲 To install this app on your iPhone/iPad: tap the <b>Share</b> button <small>(the square with an arrow)</small> and choose <b>"Add to Home Screen"</b>.',
  },
};

/* ---------------- Contenido educativo (pestaña Aprende) ---------------- */

const LEARN = {
  es: [
    { emoji: '⚽', title: 'El objetivo del juego', body: `
      <p>Dos equipos de <span class="hl">11 jugadores</span> (10 de campo + 1 portero) intentan meter el balón en la portería contraria. <b>Gana el que mete más goles.</b></p>
      <p>Solo cuenta como gol si el balón cruza <b>completamente</b> la línea de la portería.</p>
      <p>Nadie puede tocar el balón con las manos o los brazos… excepto el portero, y solo dentro de su área.</p>
      <div class="learn-tip">💡 ¿Ves "2 - 1" en un marcador? El primer número siempre es del equipo local (el de la izquierda).</div>` },
    { emoji: '⏱️', title: 'Cuánto dura un partido (y el alargue)', body: `
      <p>Un partido dura <span class="hl">90 minutos</span>: dos tiempos de 45 con un descanso de 15.</p>
      <p>El árbitro añade al final de cada tiempo unos minutos extra llamados <b>tiempo añadido o de descuento</b> (por lesiones, cambios, festejos…). Por eso ves "90' +5".</p>
      <ul>
        <li>En la <b>fase de grupos</b>, si terminan empatados… ¡queda empate y punto para cada uno!</li>
        <li>En las <b>eliminatorias</b> tiene que haber un ganador: si hay empate se juega la <span class="hl">prórroga o alargue</span> (2 tiempos extra de 15 minutos) y, si sigue el empate, una <span class="hl">tanda de penales</span>.</li>
      </ul>` },
    { emoji: '🧤', title: 'Los roles: ¿quién hace qué?', body: `
      <ul>
        <li>🧤 <b>Portero (arquero):</b> el guardián de la portería. Es el único que puede usar las manos, solo dentro de su área. Suele llevar el dorsal 1.</li>
        <li>🛡️ <b>Defensas:</b> juegan cerca de su portería y su misión es frenar a los delanteros rivales y quitarles el balón.</li>
        <li>⚙️ <b>Centrocampistas (mediocampistas):</b> el motor del equipo. Corren por todo el campo, recuperan balones y crean las jugadas de ataque.</li>
        <li>🎯 <b>Delanteros:</b> los goleadores. Juegan cerca de la portería rival y su trabajo es rematar y marcar.</li>
        <li>🟨 <b>El árbitro:</b> hace cumplir las reglas, marca las faltas y saca las tarjetas. Le ayudan los jueces de línea y el <b>VAR</b> (árbitros que revisan las jugadas polémicas en video).</li>
      </ul>
      <div class="learn-tip">💡 En la pestaña <b>Equipos</b> puedes ver la plantilla de cada selección organizada por estos roles.</div>` },
    { emoji: '🟨', title: 'La tarjeta amarilla', body: `
      <p>Es una <span class="hl">advertencia</span> del árbitro: "te estás pasando, a la próxima te vas". El partido continúa y el jugador sigue jugando.</p>
      <p><b>¿Por qué se saca?</b></p>
      <ul>
        <li>Faltas duras o repetidas</li>
        <li>Protestar demasiado al árbitro</li>
        <li>Perder tiempo a propósito</li>
        <li>Simular una falta que no existió (el famoso "piscinazo")</li>
        <li>Quitarse la camiseta al celebrar un gol (sí, ¡en serio!)</li>
      </ul>
      <p><span class="tag-y">🟨 + 🟨</span> Dos amarillas <b>en el mismo partido</b> = tarjeta roja = expulsión.</p>
      <div class="learn-tip">💡 En el Mundial, acumular 2 amarillas en partidos distintos también te hace perderte el siguiente partido.</div>` },
    { emoji: '🟥', title: 'La tarjeta roja', body: `
      <p>Es la sanción máxima: <span class="hl">expulsión inmediata</span>. El jugador debe irse a los vestuarios y <b>no puede ser reemplazado</b>: su equipo juega con 10 (¡o menos!) el resto del partido. Una desventaja enorme.</p>
      <p><b>¿Por qué se saca?</b></p>
      <ul>
        <li>Una falta violenta o peligrosa</li>
        <li>Agredir, escupir o insultar gravemente a alguien</li>
        <li>Evitar un gol claro con la mano o con una falta (por ejemplo, derribar a un delantero que iba solo hacia el portero)</li>
        <li>Recibir la segunda amarilla del partido</li>
      </ul>
      <p><span class="tag-r">🟥</span> Además, el expulsado se pierde <b>como mínimo el siguiente partido</b> del torneo (pueden ser más si la agresión fue grave).</p>` },
    { emoji: '⚪', title: 'El penal', body: `
      <p>Cuando un equipo comete una falta o toca el balón con la mano <b>dentro de su propia área</b> (el rectángulo grande que rodea la portería), el árbitro pita <span class="hl">penal</span>.</p>
      <p>Es un tiro directo desde el <b>punto de los 11 metros</b>: un jugador contra el portero, nadie más puede intervenir hasta que se patee. ¡Se convierte en gol la gran mayoría de las veces!</p>
      <p><b>No confundir con la "tanda de penales":</b> esa es la serie de 5 penales por equipo que se usa para desempatar en las eliminatorias. Si tras los 5 siguen iguales, se patea de uno en uno hasta que alguien falle (muerte súbita). 😱</p>` },
    { emoji: '🚩', title: 'El fuera de juego (offside)', body: `
      <p>La regla que más confunde, explicada fácil: un atacante <b>no puede estar "de adelantado"</b>.</p>
      <p>En el momento en que un compañero le pasa el balón, el atacante debe tener al menos a <b>dos rivales</b> (normalmente el último defensa y el portero) entre él y la portería. Si está más adelantado, es fuera de juego: tiro libre para el rival.</p>
      <p>¿Para qué existe? Para que los delanteros no se queden "esperando de pesca" al lado del portero rival toda la tarde. 🎣</p>
      <div class="learn-tip">💡 Cuando veas que anulan un gol y todos miran una línea dibujada en la pantalla, es el VAR revisando un posible fuera de juego.</div>` },
    { emoji: '📊', title: 'Cómo se ganan los puntos en los grupos', body: `
      <p>Los 48 equipos están repartidos en <b>12 grupos de 4</b> (del A al L). Cada equipo juega 3 partidos, uno contra cada rival de su grupo.</p>
      <ul>
        <li>🏆 Ganar = <span class="hl">3 puntos</span></li>
        <li>🤝 Empatar = <span class="hl">1 punto</span></li>
        <li>😢 Perder = <span class="hl">0 puntos</span></li>
      </ul>
      <p>¿Empate a puntos en la tabla? Desempata la <b>diferencia de goles</b> (DG = goles a favor − goles en contra) y luego los <b>goles a favor</b> (GF).</p>
      <p>Pasan a las eliminatorias el <b>1.º y 2.º de cada grupo</b> (24 equipos) y los <b>8 mejores terceros</b>: 32 clasificados en total.</p>
      <div class="learn-tip">💡 Todo esto lo puedes ver en vivo en la pestaña <b>Grupos</b>: las tablas se actualizan solas con cada resultado.</div>` },
    { emoji: '🏆', title: 'Las eliminatorias: camino a la final', body: `
      <p>Desde el 28 de junio el torneo cambia: <b>partido único y a todo o nada</b>. El que pierde queda eliminado.</p>
      <p>El camino completo: <b>Dieciseisavos</b> (32 equipos) → <b>Octavos</b> (16) → <b>Cuartos</b> (8) → <b>Semifinales</b> (4) → <b>la Final</b> el 19 de julio en Nueva Jersey. 🗽</p>
      <p>Los dos perdedores de las semifinales juegan un partido por el <b>tercer puesto</b>.</p>
      <p>¿Empate en eliminatorias? Prórroga de 30 minutos y, si persiste, tanda de penales. ¡Pura emoción!</p>` },
  ],
  en: [
    { emoji: '⚽', title: 'The aim of the game', body: `
      <p>Two teams of <span class="hl">11 players</span> (10 outfield + 1 goalkeeper) try to put the ball into the opposing net. <b>The team with more goals wins.</b></p>
      <p>It only counts as a goal if the ball <b>fully</b> crosses the goal line.</p>
      <p>No one may touch the ball with hands or arms… except the goalkeeper, and only inside their own box.</p>
      <div class="learn-tip">💡 See "2 - 1" on a scoreboard? The first number always belongs to the home team (the one on the left).</div>` },
    { emoji: '⏱️', title: 'How long a match lasts (and extra time)', body: `
      <p>A match lasts <span class="hl">90 minutes</span>: two 45-minute halves with a 15-minute break.</p>
      <p>The referee adds a few extra minutes at the end of each half called <b>added time</b> (for injuries, substitutions, celebrations…). That is why you see "90' +5".</p>
      <ul>
        <li>In the <b>group stage</b>, if it ends level… it is a draw and each team takes a point!</li>
        <li>In the <b>knockout stage</b> there must be a winner: if level, <span class="hl">extra time</span> is played (two extra 15-minute periods) and, if still tied, a <span class="hl">penalty shootout</span>.</li>
      </ul>` },
    { emoji: '🧤', title: 'The roles: who does what?', body: `
      <ul>
        <li>🧤 <b>Goalkeeper:</b> the guardian of the goal. The only one allowed to use hands, only inside their box. Usually wears number 1.</li>
        <li>🛡️ <b>Defenders:</b> play near their own goal; their mission is to stop the opposing forwards and win the ball back.</li>
        <li>⚙️ <b>Midfielders:</b> the engine of the team. They cover the whole pitch, recover balls and create attacking plays.</li>
        <li>🎯 <b>Forwards:</b> the goalscorers. They play near the opposing goal and their job is to finish and score.</li>
        <li>🟨 <b>The referee:</b> enforces the rules, calls fouls and shows the cards. Helped by the linesmen and <b>VAR</b> (referees reviewing controversial plays on video).</li>
      </ul>
      <div class="learn-tip">💡 In the <b>Teams</b> tab you can see every squad organised by these roles.</div>` },
    { emoji: '🟨', title: 'The yellow card', body: `
      <p>A <span class="hl">warning</span> from the referee: "you are pushing it — next one and you are off". The match continues and the player keeps playing.</p>
      <p><b>Why is it shown?</b></p>
      <ul>
        <li>Hard or repeated fouls</li>
        <li>Excessive protesting to the referee</li>
        <li>Deliberate time-wasting</li>
        <li>Faking a foul that never happened (diving)</li>
        <li>Taking your shirt off to celebrate a goal (yes, really!)</li>
      </ul>
      <p><span class="tag-y">🟨 + 🟨</span> Two yellows <b>in the same match</b> = red card = sending-off.</p>
      <div class="learn-tip">💡 At the World Cup, picking up 2 yellows across different matches also rules you out of the next game.</div>` },
    { emoji: '🟥', title: 'The red card', body: `
      <p>The maximum sanction: <span class="hl">immediate sending-off</span>. The player must leave for the dressing room and <b>cannot be replaced</b>: their team plays with 10 (or fewer!) for the rest of the match. A huge disadvantage.</p>
      <p><b>Why is it shown?</b></p>
      <ul>
        <li>A violent or dangerous foul</li>
        <li>Assaulting, spitting at or seriously insulting someone</li>
        <li>Denying a clear goal with a hand or a foul (e.g. bringing down a forward running alone at the keeper)</li>
        <li>Receiving a second yellow in the match</li>
      </ul>
      <p><span class="tag-r">🟥</span> On top of that, the sent-off player misses <b>at least the next match</b> of the tournament (more if the offence was serious).</p>` },
    { emoji: '⚪', title: 'The penalty', body: `
      <p>When a team commits a foul or handles the ball <b>inside its own penalty area</b> (the big rectangle around the goal), the referee awards a <span class="hl">penalty</span>.</p>
      <p>A direct shot from the <b>11-metre spot</b>: one player against the goalkeeper, nobody else may interfere until it is taken. It ends in a goal most of the time!</p>
      <p><b>Not to be confused with the "penalty shootout":</b> that is the series of 5 penalties per team used to break ties in the knockout rounds. If still level after 5, they go one by one until someone misses (sudden death). 😱</p>` },
    { emoji: '🚩', title: 'Offside', body: `
      <p>The most confusing rule, made easy: an attacker <b>cannot hang around ahead of play</b>.</p>
      <p>At the moment a teammate passes the ball, the attacker needs at least <b>two opponents</b> (usually the last defender and the goalkeeper) between them and the goal. If they are beyond that, it is offside: free kick to the opponent.</p>
      <p>Why does it exist? So forwards cannot just camp next to the opposing keeper "fishing" all afternoon. 🎣</p>
      <div class="learn-tip">💡 When a goal is disallowed and everyone stares at a line drawn on the screen, that is VAR checking a possible offside.</div>` },
    { emoji: '📊', title: 'How group points are earned', body: `
      <p>The 48 teams are split into <b>12 groups of 4</b> (A to L). Each team plays 3 matches, one against each group rival.</p>
      <ul>
        <li>🏆 Win = <span class="hl">3 points</span></li>
        <li>🤝 Draw = <span class="hl">1 point</span></li>
        <li>😢 Loss = <span class="hl">0 points</span></li>
      </ul>
      <p>Level on points? <b>Goal difference</b> breaks the tie (GD = goals for − goals against), then <b>goals for</b> (GF).</p>
      <p>The <b>1st and 2nd of each group</b> (24 teams) plus the <b>8 best third-placed teams</b> advance: 32 qualifiers in total.</p>
      <div class="learn-tip">💡 You can watch all of this live in the <b>Groups</b> tab: the tables update automatically with every result.</div>` },
    { emoji: '🏆', title: 'The knockout rounds: road to the final', body: `
      <p>From June 28 the tournament changes: <b>single match, all or nothing</b>. Lose and you are out.</p>
      <p>The full road: <b>Round of 32</b> → <b>Round of 16</b> → <b>Quarter-finals</b> → <b>Semi-finals</b> → <b>the Final</b> on July 19 in New Jersey. 🗽</p>
      <p>The two semi-final losers play a match for <b>third place</b>.</p>
      <p>A draw in the knockouts? 30 minutes of extra time and, if still level, a penalty shootout. Pure drama!</p>` },
  ],
};

// Zonas horarias ofrecidas en el selector (etiqueta por idioma)
const TZ_CATALOG = [
  { tz: 'Europe/Madrid', es: '🇪🇸 España', en: '🇪🇸 Spain', pinned: true },
  { tz: 'America/La_Paz', es: '🇧🇴 Bolivia', en: '🇧🇴 Bolivia', pinned: true },
  { tz: 'America/Argentina/Buenos_Aires', es: '🇦🇷 Argentina', en: '🇦🇷 Argentina' },
  { tz: 'America/Sao_Paulo', es: '🇧🇷 Brasil', en: '🇧🇷 Brazil' },
  { tz: 'America/Santiago', es: '🇨🇱 Chile', en: '🇨🇱 Chile' },
  { tz: 'America/Bogota', es: '🇨🇴 Colombia', en: '🇨🇴 Colombia' },
  { tz: 'America/Costa_Rica', es: '🇨🇷 Costa Rica', en: '🇨🇷 Costa Rica' },
  { tz: 'America/Havana', es: '🇨🇺 Cuba', en: '🇨🇺 Cuba' },
  { tz: 'America/Guayaquil', es: '🇪🇨 Ecuador', en: '🇪🇨 Ecuador' },
  { tz: 'America/El_Salvador', es: '🇸🇻 El Salvador', en: '🇸🇻 El Salvador' },
  { tz: 'America/New_York', es: '🇺🇸 EE. UU. (Este)', en: '🇺🇸 USA (Eastern)' },
  { tz: 'America/Chicago', es: '🇺🇸 EE. UU. (Centro)', en: '🇺🇸 USA (Central)' },
  { tz: 'America/Denver', es: '🇺🇸 EE. UU. (Montaña)', en: '🇺🇸 USA (Mountain)' },
  { tz: 'America/Los_Angeles', es: '🇺🇸 EE. UU. (Pacífico)', en: '🇺🇸 USA (Pacific)' },
  { tz: 'America/Guatemala', es: '🇬🇹 Guatemala', en: '🇬🇹 Guatemala' },
  { tz: 'America/Tegucigalpa', es: '🇭🇳 Honduras', en: '🇭🇳 Honduras' },
  { tz: 'America/Mexico_City', es: '🇲🇽 México (CDMX)', en: '🇲🇽 Mexico (CDMX)' },
  { tz: 'America/Managua', es: '🇳🇮 Nicaragua', en: '🇳🇮 Nicaragua' },
  { tz: 'America/Panama', es: '🇵🇦 Panamá', en: '🇵🇦 Panama' },
  { tz: 'America/Asuncion', es: '🇵🇾 Paraguay', en: '🇵🇾 Paraguay' },
  { tz: 'America/Lima', es: '🇵🇪 Perú', en: '🇵🇪 Peru' },
  { tz: 'America/Puerto_Rico', es: '🇵🇷 Puerto Rico', en: '🇵🇷 Puerto Rico' },
  { tz: 'America/Santo_Domingo', es: '🇩🇴 Rep. Dominicana', en: '🇩🇴 Dominican Rep.' },
  { tz: 'America/Montevideo', es: '🇺🇾 Uruguay', en: '🇺🇾 Uruguay' },
  { tz: 'America/Caracas', es: '🇻🇪 Venezuela', en: '🇻🇪 Venezuela' },
  { tz: 'America/Toronto', es: '🇨🇦 Canadá (Toronto)', en: '🇨🇦 Canada (Toronto)' },
  { tz: 'Europe/London', es: '🇬🇧 Reino Unido', en: '🇬🇧 United Kingdom' },
  { tz: 'Europe/Paris', es: '🇫🇷 Francia', en: '🇫🇷 France' },
  { tz: 'Europe/Berlin', es: '🇩🇪 Alemania', en: '🇩🇪 Germany' },
  { tz: 'Europe/Rome', es: '🇮🇹 Italia', en: '🇮🇹 Italy' },
  { tz: 'Europe/Lisbon', es: '🇵🇹 Portugal', en: '🇵🇹 Portugal' },
  { tz: 'Africa/Casablanca', es: '🇲🇦 Marruecos', en: '🇲🇦 Morocco' },
  { tz: 'Asia/Tokyo', es: '🇯🇵 Japón', en: '🇯🇵 Japan' },
  { tz: 'Asia/Seoul', es: '🇰🇷 Corea del Sur', en: '🇰🇷 South Korea' },
  { tz: 'Asia/Riyadh', es: '🇸🇦 Arabia Saudita', en: '🇸🇦 Saudi Arabia' },
  { tz: 'Australia/Sydney', es: '🇦🇺 Australia (Sídney)', en: '🇦🇺 Australia (Sydney)' },
];

const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PLAY']);
const FT_STATUSES = new Set(['FT', 'AET', 'PEN', 'AP', 'FIN', 'MATCH FINISHED', 'AOT']);

const state = {
  lang: localStorage.getItem('wc.lang') || 'es',
  view: 'matches',
  selectedDate: null,
  selectedTeam: null,
  activeTz: localStorage.getItem('wc.activeTz') || 'Europe/Madrid',
  customTzs: JSON.parse(localStorage.getItem('wc.customTzs') || '[]'),
  matches: [],
  teams: {},
  squads: {},
  offline: false,
  updatedAt: null,
};

const $ = (sel) => document.querySelector(sel);
const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Utilidades de tiempo ---------------- */

function matchDateUTC(m) {
  // strTimestamp de TheSportsDB es UTC sin sufijo Z
  return new Date(m.strTimestamp + (m.strTimestamp.endsWith('Z') ? '' : 'Z'));
}

function dateInTz(date, tz) {
  // YYYY-MM-DD del instante `date` visto desde la zona `tz`
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function timeInTz(date, tz) {
  return new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function tzLabel(tz) {
  const entry = TZ_CATALOG.find((z) => z.tz === tz);
  if (entry) return entry[state.lang] || entry.es;
  if (tz === Intl.DateTimeFormat().resolvedOptions().timeZone) return `📍 ${t('tzLocal')}`;
  return tz.split('/').pop().replace(/_/g, ' ');
}

function activeTzList() {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const pinned = TZ_CATALOG.filter((z) => z.pinned).map((z) => z.tz);
  const list = [...pinned];
  if (!list.includes(local)) list.push(local);
  for (const tz of state.customTzs) if (!list.includes(tz)) list.push(tz);
  return list;
}

function* dateRange(from, to) {
  const d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (d <= end) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

/* ---------------- Estado de los partidos ---------------- */

function normStatus(m) {
  const raw = (m.strStatus || '').toUpperCase().trim();
  if (m.strPostponed === 'yes' || raw === 'PST' || raw === 'POSTPONED') return 'PST';
  if (LIVE_STATUSES.has(raw)) return raw === 'HT' ? 'HT' : 'LIVE';
  if (FT_STATUSES.has(raw)) return 'FT';
  if ((raw === 'NS' || raw === '' || raw === 'NOT STARTED') && m.intHomeScore != null && m.intAwayScore != null) {
    // Algunos partidos terminados quedan con estado NS pero ya tienen marcador
    return matchDateUTC(m).getTime() < Date.now() - 3 * 3600e3 ? 'FT' : 'LIVE';
  }
  return 'NS';
}

function statusBadge(m) {
  const s = normStatus(m);
  if (s === 'LIVE') {
    const raw = (m.strStatus || '').toUpperCase();
    const extra = raw === 'ET' ? ` · ${t('statusET')}` : raw === 'P' ? ` · ${t('statusPEN')}` : raw && raw !== 'LIVE' && raw !== 'IN PLAY' ? ` · ${raw}` : '';
    return `<span class="badge-status live">● ${t('statusLive')}${extra}</span>`;
  }
  if (s === 'HT') return `<span class="badge-status live">${t('statusHT')}</span>`;
  if (s === 'FT') return `<span class="badge-status ft">${t('statusFT')}</span>`;
  if (s === 'PST') return `<span class="badge-status">${t('statusPST')}</span>`;
  return `<span class="badge-status">${t('statusNS')}</span>`;
}

function isLive(m) { const s = normStatus(m); return s === 'LIVE' || s === 'HT'; }
function isFinished(m) { return normStatus(m) === 'FT'; }

/* ---------------- Carga de datos ---------------- */

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function loadStaticData() {
  const [teams, squads] = await Promise.all([
    fetchJson('data/teams.json'),
    fetchJson('data/squads.json'),
  ]);
  state.teams = teams;
  state.squads = squads;
}

async function fetchRound(round) {
  const d = await fetchJson(`${API}/eventsround.php?id=${LEAGUE_ID}&r=${round}&s=${SEASON}`);
  return d.events || [];
}

async function loadMatches() {
  try {
    const rounds = [...GROUP_ROUNDS];
    if (dateInTz(new Date(), 'UTC') >= KO_START) rounds.push(...KO_ROUNDS);
    const results = await Promise.all(rounds.map((r) => fetchRound(r).catch(() => [])));
    const events = results.flat();
    if (!events.length) throw new Error('empty');
    state.matches = events.sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp));
    state.offline = false;
  } catch (e) {
    if (!state.matches.length) {
      try {
        state.matches = await fetchJson('data/schedule-fallback.json');
      } catch (_) { state.matches = []; }
    }
    state.offline = true;
  }
  state.updatedAt = new Date();
}

/* ---------------- Wikipedia (fotos y biografías) ---------------- */

const wikiCache = {
  get(key) {
    try {
      const raw = localStorage.getItem('wiki:' + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.ts > 7 * 86400e3) return null;
      return obj.v;
    } catch (_) { return null; }
  },
  set(key, v) {
    try { localStorage.setItem('wiki:' + key, JSON.stringify({ ts: Date.now(), v })); } catch (_) { /* lleno */ }
  },
};

async function wikiSummary(lang, title) {
  const key = `${lang}:${title}`;
  const cached = wikiCache.get(key);
  if (cached) return cached.notFound ? null : cached;
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
    if (!res.ok) throw new Error('404');
    const d = await res.json();
    const v = {
      extract: d.extract || '',
      thumb: d.thumbnail ? d.thumbnail.source : null,
      url: d.content_urls ? d.content_urls.desktop.page : null,
      desc: d.description || '',
    };
    wikiCache.set(key, v);
    return v;
  } catch (_) {
    wikiCache.set(key, { notFound: true });
    return null;
  }
}

async function wikiSummaryLocalized(enTitle) {
  // Biografía en el idioma de la interfaz; si no existe, en inglés
  if (state.lang === 'es') {
    let s = await wikiSummary('es', enTitle);
    if (s && s.extract) return { ...s, lang: 'es' };
    // buscamos el título del artículo en español vía langlinks
    try {
      const key = `eslink:${enTitle}`;
      let esTitle = wikiCache.get(key);
      if (esTitle === null || esTitle === undefined) {
        const d = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(enTitle)}&prop=langlinks&lllang=es&format=json&formatversion=2&redirects=1&origin=*`);
        const page = d.query && d.query.pages && d.query.pages[0];
        esTitle = (page && page.langlinks && page.langlinks[0] && page.langlinks[0].title) || '';
        wikiCache.set(key, esTitle);
      }
      if (esTitle) {
        s = await wikiSummary('es', esTitle);
        if (s && s.extract) return { ...s, lang: 'es' };
      }
    } catch (_) { /* seguimos con inglés */ }
  }
  const en = await wikiSummary('en', enTitle);
  return en ? { ...en, lang: 'en' } : null;
}

/* ---------------- ESPN: goles, tarjetas y penales por partido ---------------- */

const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const espnCache = new Map(); // 'YYYY-MM-DD' -> { ts, events }
let espnToTsdb = null;

function normTeamName(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function buildEspnMap() {
  espnToTsdb = {};
  for (const [name, tm] of Object.entries(state.teams)) {
    espnToTsdb[normTeamName(name)] = name;
    if (tm.espn) espnToTsdb[normTeamName(tm.espn)] = name;
  }
}

function prevDay(isoDate) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function fetchEspnDate(isoDate) {
  const cached = espnCache.get(isoDate);
  const todayUTC = new Date().toISOString().slice(0, 10);
  const ttl = isoDate >= prevDay(todayUTC) ? REFRESH_MS : Infinity;
  if (cached && Date.now() - cached.ts < ttl) return false;
  try {
    const d = await fetchJson(`${ESPN_API}?dates=${isoDate.replace(/-/g, '')}`);
    espnCache.set(isoDate, { ts: Date.now(), events: d.events || [] });
    return true;
  } catch (_) {
    if (!cached) espnCache.set(isoDate, { ts: Date.now(), events: [] });
    return false;
  }
}

// Busca en la caché el evento de ESPN equivalente a un partido de TheSportsDB
function espnLookup(m) {
  if (!espnToTsdb) buildEspnMap();
  const kickoff = matchDateUTC(m).getTime();
  const want = new Set([m.strHomeTeam, m.strAwayTeam]);
  for (const date of [m.strTimestamp.slice(0, 10), prevDay(m.strTimestamp.slice(0, 10))]) {
    const cached = espnCache.get(date);
    if (!cached) continue;
    for (const e of cached.events) {
      const comp = e.competitions && e.competitions[0];
      if (!comp) continue;
      const names = (comp.competitors || []).map((c) => espnToTsdb[normTeamName(c.team.displayName)]);
      if (!names.every((n) => want.has(n))) continue;
      if (Math.abs(new Date(e.date).getTime() - kickoff) > 6 * 3600e3) continue;
      return e;
    }
  }
  return null;
}

async function ensureEspnFor(matches) {
  const dates = new Set();
  for (const m of matches) {
    if (normStatus(m) === 'NS' && matchDateUTC(m).getTime() > Date.now()) continue;
    const d = m.strTimestamp.slice(0, 10);
    dates.add(d); dates.add(prevDay(d));
  }
  const changes = await Promise.all([...dates].map(fetchEspnDate));
  return changes.some(Boolean);
}

function classifyDetail(det) {
  const txt = ((det.type && det.type.text) || '').toLowerCase();
  if (det.redCard) return { icon: '🟥', cls: 'red', label: t('evRed'), explain: t('expRed') };
  if (det.yellowCard) return { icon: '🟨', cls: 'yellow', label: t('evYellow'), explain: t('expYellow') };
  if (det.penaltyKick || txt.includes('penalty')) {
    return det.scoringPlay
      ? { icon: '⚽', cls: 'goal', label: t('evPenScored'), explain: t('expPenScored') }
      : { icon: '❌', cls: '', label: t('evPenMissed'), explain: t('expPenMissed') };
  }
  if (det.ownGoal || txt.includes('own goal')) return { icon: '⚽', cls: 'goal', label: t('evOwnGoal'), explain: t('expOwnGoal') };
  if (det.scoringPlay) {
    let label = t('evGoal');
    if (txt.includes('header')) label = t('evGoalHeader');
    else if (txt.includes('free')) label = t('evGoalFK');
    else if (txt.includes('volley')) label = t('evGoalVolley');
    return { icon: '⚽', cls: 'goal', label, explain: null };
  }
  return null;
}

function espnDetails(m) {
  const e = espnLookup(m);
  if (!e) return null;
  const comp = e.competitions[0];
  const byEspnId = {};
  for (const c of comp.competitors || []) byEspnId[c.team.id] = espnToTsdb[normTeamName(c.team.displayName)] || c.team.displayName;
  const items = [];
  for (const det of comp.details || []) {
    const kind = classifyDetail(det);
    if (!kind) continue;
    const ath = (det.athletesInvolved && det.athletesInvolved[0] && det.athletesInvolved[0].displayName) || '';
    items.push({
      minute: (det.clock && det.clock.displayValue) || '',
      minuteVal: (det.clock && det.clock.value) || 0,
      player: ath,
      team: byEspnId[det.team && det.team.id] || '',
      ...kind,
    });
  }
  items.sort((a, b) => a.minuteVal - b.minuteVal);
  const shootout = (comp.competitors || []).some((c) => c.shootoutScore != null)
    ? (comp.competitors || []).map((c) => ({ team: byEspnId[c.team.id], score: c.shootoutScore })) : null;
  const statusName = (e.status && e.status.type && e.status.type.name) || '';
  return { items, shootout, wentToET: /OVERTIME|AET|EXTRA/i.test(statusName) || (m.strStatus || '').toUpperCase() === 'AET' };
}

/* ---------------- Modal: detalle del partido ---------------- */

async function openMatchModal(idEvent) {
  const m = state.matches.find((x) => x.idEvent === idEvent);
  if (!m) return;
  const tmH = state.teams[m.strHomeTeam], tmA = state.teams[m.strAwayTeam];
  const hasScore = m.intHomeScore != null && m.intAwayScore != null;
  const started = normStatus(m) !== 'NS';
  const groupTxt = ['1', '2', '3'].includes(String(m.intRound)) && tmH ? `${t('group')} ${tmH.group}` : (KO_LABELS[m.intRound] ? KO_LABELS[m.intRound][state.lang] : '');

  $('#modalContent').innerHTML = `
    <div class="md-header">
      <div class="md-team"><img src="${esc(m.strHomeTeamBadge || (tmH && tmH.badge) || '')}" alt=""><div class="tname">${esc(teamEs(m.strHomeTeam))}</div></div>
      <div class="md-score">${hasScore && started ? `${esc(m.intHomeScore)} - ${esc(m.intAwayScore)}` : timeInTz(matchDateUTC(m), state.activeTz)}</div>
      <div class="md-team"><img src="${esc(m.strAwayTeamBadge || (tmA && tmA.badge) || '')}" alt=""><div class="tname">${esc(teamEs(m.strAwayTeam))}</div></div>
    </div>
    <div class="md-sub">${statusBadge(m)}<br>${groupTxt ? esc(groupTxt) + ' · ' : ''}🏟️ ${esc(m.strVenue || '')}${m.strCountry ? ' · ' + esc(m.strCountry) : ''}</div>
    <div id="mdTimeline">${started ? `<p class="tl-empty">…</p>` : `<p class="tl-empty">${esc(t('tlNotStarted'))}</p>`}</div>
    <div class="edu-banner">🎓 ${t('eduBanner')} <span class="edu-link" id="eduGoLearn">${esc(t('goLearn'))}</span></div>`;
  $('#modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  $('#eduGoLearn').addEventListener('click', () => { closeModal(); state.view = 'learn'; render(); window.scrollTo({ top: 0 }); });

  if (!started) return;
  await ensureEspnFor([m]);
  const box = document.getElementById('mdTimeline');
  if (!box) return; // el modal se cerró
  const d = espnDetails(m);
  if (!d || (!d.items.length && !d.shootout)) {
    box.innerHTML = `<p class="tl-empty">${esc(t('tlEmpty'))}</p>`;
    return;
  }
  let html = '';
  if (d.wentToET) html += `<p class="tl-explain edu-banner">${esc(t('expET'))}</p>`;
  if (d.shootout) {
    html += `<div class="md-shootout">⚪ ${esc(t('shootoutLabel'))}: ${d.shootout.map((s) => `${esc(teamEs(s.team))} ${esc(s.score)}`).join(' - ')}</div>
      <p class="tl-explain edu-banner">${esc(t('expShootout'))}</p>`;
  }
  html += `<div class="timeline">${d.items.map((it) => `
    <div class="tl-item ${it.cls}">
      <span class="tl-min">${esc(it.minute)}</span>
      <span class="tl-icon">${it.icon}</span>
      <div class="tl-body">
        <div class="tl-title">${esc(it.label)}: <b>${esc(it.player || '—')}</b> <small>(${esc(teamEs(it.team))})</small></div>
        ${it.explain ? `<div class="tl-explain">${esc(it.explain)}</div>` : ''}
      </div>
    </div>`).join('')}</div>`;
  box.innerHTML = html;
}

/* ---------------- Render: barra superior ---------------- */

function applyI18nStatic() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
}

function renderTzBar() {
  const chips = $('#tzChips');
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chips.innerHTML = activeTzList().map((tz) => {
    const removable = !TZ_CATALOG.find((z) => z.tz === tz && z.pinned) && tz !== local;
    return `<button class="tz-chip ${tz === state.activeTz ? 'active' : ''}" data-tz="${esc(tz)}" title="${esc(tz)}">
      ${esc(tzLabel(tz))}${removable ? `<span class="rm" data-rm="${esc(tz)}">✕</span>` : ''}
    </button>`;
  }).join('');

  const used = new Set(activeTzList());
  const sel = $('#tzAdd');
  sel.innerHTML = `<option value="">${esc(t('tzAddPlaceholder'))}</option>` +
    TZ_CATALOG.filter((z) => !used.has(z.tz)).map((z) => `<option value="${esc(z.tz)}">${esc(z[state.lang] || z.es)}</option>`).join('');
}

/* ---------------- Render: vista Partidos ---------------- */

function teamEs(tsdbName) {
  const tm = state.teams[tsdbName];
  return tm ? (state.lang === 'es' ? tm.es : tm.en) : tsdbName;
}

function renderMatchCard(m) {
  const d = matchDateUTC(m);
  const fin = isFinished(m);
  const live = isLive(m);
  const hs = m.intHomeScore, as = m.intAwayScore;
  const hasScore = hs != null && as != null;
  let homeCls = '', awayCls = '';
  if (fin && hasScore) {
    if (+hs > +as) { homeCls = 'winner'; awayCls = 'loser'; }
    else if (+as > +hs) { awayCls = 'winner'; homeCls = 'loser'; }
  }
  const tm = state.teams[m.strHomeTeam];
  const groupTxt = ['1', '2', '3'].includes(String(m.intRound)) && tm ? `${t('group')} ${tm.group}` : (KO_LABELS[m.intRound] ? KO_LABELS[m.intRound][state.lang] : '');
  const times = activeTzList().map((tz) =>
    `<span class="time-pill">${esc(tzLabel(tz))} <b>${timeInTz(d, tz)}</b></span>`).join('');

  return `<article class="match-card ${live ? 'live' : ''}" data-event="${esc(m.idEvent)}">
    <div class="match-top">
      <span class="match-meta">${groupTxt ? `<span>${esc(groupTxt)}</span>` : ''}<span>🏟️ ${esc(m.strVenue || '')}${m.strCountry ? ' · ' + esc(m.strCountry) : ''}</span></span>
      ${statusBadge(m)}
    </div>
    <div class="match-row">
      <div class="team-cell ${homeCls}" data-team="${esc(m.strHomeTeam)}">
        <img src="${esc(m.strHomeTeamBadge || '')}" alt="" loading="lazy"><span class="tname">${esc(teamEs(m.strHomeTeam))}</span>
      </div>
      <div class="score-cell">${hasScore && (live || fin)
        ? `<div class="score">${esc(hs)} - ${esc(as)}</div>`
        : `<div class="vs">${timeInTz(d, state.activeTz)}</div>`}
      </div>
      <div class="team-cell right ${awayCls}" data-team="${esc(m.strAwayTeam)}">
        <img src="${esc(m.strAwayTeamBadge || '')}" alt="" loading="lazy"><span class="tname">${esc(teamEs(m.strAwayTeam))}</span>
      </div>
    </div>
    <div class="times-row">${times}</div>
    ${renderEventChips(m)}
    <div class="detail-hint">${esc(t('detailHint'))}</div>
  </article>`;
}

function renderEventChips(m) {
  if (normStatus(m) === 'NS') return '';
  const d = espnDetails(m);
  if (!d || !d.items.length) return '';
  return `<div class="events-row">${d.items.map((it) =>
    `<span class="event-chip ${it.cls}">${it.icon} ${esc(it.minute)} ${esc(it.player.split(' ').slice(-1)[0])}</span>`).join('')}</div>`;
}

function renderMatchesView() {
  const tz = state.activeTz;
  const byDay = new Map();
  for (const m of state.matches) {
    const day = dateInTz(matchDateUTC(m), tz);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(m);
  }
  const today = dateInTz(new Date(), tz);
  if (!state.selectedDate) {
    state.selectedDate = (today >= TOURNAMENT_START && today <= TOURNAMENT_END) ? today : TOURNAMENT_START;
  }

  const fmtDow = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'short', timeZone: 'UTC' });
  const fmtMon = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { month: 'short', timeZone: 'UTC' });
  let strip = '';
  for (const day of dateRange(TOURNAMENT_START, TOURNAMENT_END)) {
    const dObj = new Date(day + 'T00:00:00Z');
    const dayMatches = byDay.get(day) || [];
    const hasLive = dayMatches.some(isLive);
    strip += `<button class="date-pill ${day === state.selectedDate ? 'active' : ''} ${hasLive ? 'has-live' : ''} ${day === today ? 'today' : ''}" data-date="${day}">
      <div class="dow">${esc(fmtDow.format(dObj))}</div><div class="dnum">${dObj.getUTCDate()}</div><div class="mon">${esc(fmtMon.format(dObj))}</div>
    </button>`;
  }

  const dayMatches = byDay.get(state.selectedDate) || [];
  const fmtLong = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayLabel = fmtLong.format(new Date(state.selectedDate + 'T00:00:00Z'));

  $('#view').innerHTML = `
    ${state.offline ? `<div class="error-banner">${esc(t('offline'))}</div>` : ''}
    <div class="date-strip">${strip}</div>
    <h2 class="day-title">${esc(t('matchesOf'))} <b>${esc(dayLabel)}</b> · ${esc(tzLabel(tz))}</h2>
    <div class="match-list">
      ${dayMatches.length ? dayMatches.map(renderMatchCard).join('') : `<p class="empty-day">😴 ${esc(t('noMatches'))}</p>`}
    </div>`;

  const active = $('.date-pill.active');
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });

  // carga asíncrona de goles/tarjetas (ESPN) para el día visible
  const shownDate = state.selectedDate;
  ensureEspnFor(dayMatches).then((changed) => {
    if (changed && state.view === 'matches' && state.selectedDate === shownDate) renderMatchesView();
  });
}

/* ---------------- Render: vista Grupos ---------------- */

function computeStandings() {
  const groups = {};
  for (const [name, tm] of Object.entries(state.teams)) {
    if (!groups[tm.group]) groups[tm.group] = {};
    groups[tm.group][name] = { name, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
  }
  for (const m of state.matches) {
    if (!['1', '2', '3'].includes(String(m.intRound))) continue;
    if (!isFinished(m) || m.intHomeScore == null || m.intAwayScore == null) continue;
    const tmH = state.teams[m.strHomeTeam], tmA = state.teams[m.strAwayTeam];
    if (!tmH || !tmA) continue;
    const h = groups[tmH.group][m.strHomeTeam], a = groups[tmA.group][m.strAwayTeam];
    const hs = +m.intHomeScore, as = +m.intAwayScore;
    h.pj++; a.pj++; h.gf += hs; h.gc += as; a.gf += as; a.gc += hs;
    if (hs > as) { h.g++; a.p++; h.pts += 3; }
    else if (as > hs) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts++; a.pts++; }
  }
  const sorted = {};
  for (const g of Object.keys(groups).sort()) {
    sorted[g] = Object.values(groups[g]).sort((x, y) =>
      y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf || teamEs(x.name).localeCompare(teamEs(y.name)));
  }
  return sorted;
}

function standingsRow(row, pos, cls) {
  const tm = state.teams[row.name];
  return `<tr class="${cls}">
    <td><span class="team-mini" data-team="${esc(row.name)}"><img src="${esc(tm.badge)}" alt="" loading="lazy">${esc(teamEs(row.name))}</span></td>
    <td>${row.pj}</td><td>${row.g}</td><td>${row.e}</td><td>${row.p}</td>
    <td>${row.gf}</td><td>${row.gc}</td><td>${row.gf - row.gc}</td><td class="pts">${row.pts}</td>
  </tr>`;
}

function renderGroupsView() {
  const standings = computeStandings();
  const header = `<tr><th>${esc(t('thTeam'))}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>`;
  let html = `<details class="explainer">
      <summary>${t('groupsExplainerTitle')}</summary>
      <div class="exp-body">${t('groupsExplainerBody')}</div>
    </details>
    <div class="legend">
      <span><i style="background:var(--accent)"></i>${esc(t('standingsLegend1'))}</span>
      <span><i style="background:var(--gold)"></i>${esc(t('standingsLegend2'))}</span>
    </div><div class="groups-grid">`;
  const thirds = [];
  for (const [g, rows] of Object.entries(standings)) {
    html += `<div class="group-card"><h3>${esc(t('group'))} ${g}</h3><table class="standings">${header}
      ${rows.map((r, i) => { if (i === 2) thirds.push({ ...r, group: g }); return standingsRow(r, i, i < 2 ? 'q1' : i === 2 ? 'q3' : ''); }).join('')}
    </table></div>`;
  }
  html += '</div>';

  thirds.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
  html += `<h3 class="section-title">${esc(t('bestThirds'))}</h3>
    <div class="group-card"><table class="standings">
      <tr><th>${esc(t('thTeam'))}</th><th>${esc(t('group'))}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>
      ${thirds.map((r, i) => {
        const tm = state.teams[r.name];
        return `<tr class="${i < 8 ? 'q3' : ''}">
          <td><span class="team-mini" data-team="${esc(r.name)}"><img src="${esc(tm.badge)}" alt="" loading="lazy">${esc(teamEs(r.name))}</span></td>
          <td>${r.group}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf}</td><td>${r.gc}</td><td>${r.gf - r.gc}</td><td class="pts">${r.pts}</td></tr>`;
      }).join('')}
    </table></div>`;
  $('#view').innerHTML = html;
}

/* ---------------- Render: vista Eliminatorias ---------------- */

function renderKnockoutView() {
  const explainer = `<details class="explainer">
      <summary>${t('koExplainerTitle')}</summary>
      <div class="exp-body">${t('koExplainerBody')}</div>
    </details>`;
  const koMatches = state.matches.filter((m) => KO_LABELS[m.intRound]);
  if (!koMatches.length) {
    $('#view').innerHTML = `${explainer}<p class="ko-note">🏆 ${esc(t('koEmpty'))}</p>`;
    return;
  }
  let html = explainer;
  for (const round of KO_ROUNDS) {
    const ms = koMatches.filter((m) => String(m.intRound) === String(round));
    if (!ms.length) continue;
    html += `<section class="ko-stage"><h3>${esc(KO_LABELS[round][state.lang])}</h3>
      <div class="match-list">${ms.map(renderMatchCard).join('')}</div></section>`;
  }
  $('#view').innerHTML = html;
}

/* ---------------- Render: vista Aprende ---------------- */

function renderLearnView() {
  const cards = LEARN[state.lang] || LEARN.es;
  $('#view').innerHTML = `
    <p class="learn-intro">${esc(t('learnIntro'))}</p>
    <div class="learn-grid">
      ${cards.map((c, i) => `
        <details class="learn-card" ${i === 0 ? 'open' : ''}>
          <summary><span class="emoji">${c.emoji}</span>${esc(c.title)}</summary>
          <div class="learn-body">${c.body}</div>
        </details>`).join('')}
    </div>`;
}

/* ---------------- Render: vista Equipos ---------------- */

function renderTeamsView() {
  if (state.selectedTeam) { renderTeamDetail(state.selectedTeam); return; }
  const entries = Object.entries(state.teams).sort((a, b) => a[1].group.localeCompare(b[1].group) || teamEs(a[0]).localeCompare(teamEs(b[0])));
  $('#view').innerHTML = `<div class="teams-grid">${entries.map(([name, tm]) => `
    <div class="team-tile" data-team="${esc(name)}">
      <img src="${esc(tm.badge)}" alt="" loading="lazy">
      <div class="tname">${esc(teamEs(name))}</div>
      <div class="tgroup">${esc(t('group'))} ${tm.group}</div>
    </div>`).join('')}</div>`;
}

function playerAge(dob) {
  if (!dob) return null;
  const b = new Date(dob + 'T00:00:00Z'), now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const mDiff = now.getUTCMonth() - b.getUTCMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

function renderTeamDetail(tsdbName) {
  const tm = state.teams[tsdbName];
  const squad = state.squads[tm.wiki];
  if (!squad) { $('#view').innerHTML = '<p class="empty-day">—</p>'; return; }
  const byPos = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of squad.players) (byPos[p.pos] || byPos.MF).push(p);

  let html = `<button class="back-btn" id="backTeams">${esc(t('back'))}</button>
    <div class="team-header">
      <img src="${esc(tm.badge)}" alt="">
      <div><h2>${esc(teamEs(tsdbName))}</h2><div class="tgroup">${esc(t('group'))} ${tm.group} · ${squad.players.length} ${esc(t('players'))}</div></div>
    </div>`;
  for (const pos of ['GK', 'DF', 'MF', 'FW']) {
    if (!byPos[pos].length) continue;
    html += `<h3 class="pos-title">${esc(t('pos' + pos))}</h3><div class="players-grid">
      ${byPos[pos].map((p) => {
        const age = playerAge(p.dob);
        return `<div class="player-card" data-player="${esc(p.wiki || p.name)}" data-team="${esc(tsdbName)}">
          <div class="player-photo" data-photo="${esc(p.wiki || '')}">👤</div>
          <div class="player-info">
            <div class="pname"><span class="pnum">${esc(p.no || '–')}</span> ${esc(p.name)}</div>
            <div class="pmeta">${age != null ? `${age} ${esc(t('age'))} · ` : ''}${esc(t('p' + p.pos) || p.pos)}</div>
            <div class="pclub">${esc(p.club || '')}</div>
          </div>
        </div>`;
      }).join('')}</div>`;
  }
  $('#view').innerHTML = html;
  lazyLoadPhotos();
}

function lazyLoadPhotos() {
  const obs = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      observer.unobserve(el);
      const title = el.dataset.photo;
      if (!title) continue;
      wikiSummary('en', title).then((s) => {
        if (s && s.thumb) {
          const img = document.createElement('img');
          img.src = s.thumb; img.alt = ''; img.className = 'player-photo';
          el.replaceWith(img);
        }
      });
    }
  }, { rootMargin: '200px' });
  document.querySelectorAll('.player-photo[data-photo]').forEach((el) => obs.observe(el));
}

/* ---------------- Modal: biografía del jugador ---------------- */

async function openPlayerModal(wikiTitle, tsdbTeam) {
  const tm = state.teams[tsdbTeam];
  const squad = tm && state.squads[tm.wiki];
  const p = squad && squad.players.find((x) => (x.wiki || x.name) === wikiTitle);
  if (!p) return;
  const age = playerAge(p.dob);
  const dobFmt = p.dob ? new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(p.dob + 'T00:00:00Z')) : '—';

  $('#modalContent').innerHTML = `
    <div class="bio-header">
      <div class="bio-photo" id="bioPhoto"></div>
      <div>
        <h3>${p.no ? `<span class="pnum">${esc(p.no)}</span> ` : ''}${esc(p.name)}</h3>
        <div class="bmeta">
          ${esc(t('position'))}: <b>${esc(t('p' + p.pos) || p.pos)}</b><br>
          ${esc(t('nationality'))}: <b>${esc(teamEs(tsdbTeam))}</b><br>
          ${esc(t('born'))}: <b>${esc(dobFmt)}</b>${age != null ? ` (${age} ${esc(t('age'))})` : ''}<br>
          ${esc(t('club'))}: <b>${esc(p.club || '—')}</b>
        </div>
      </div>
    </div>
    <div class="bio-stats">
      <div class="bio-stat"><b>${esc(p.caps ?? '—')}</b><span>${esc(t('caps'))}</span></div>
      <div class="bio-stat"><b>${esc(p.goals ?? '—')}</b><span>${esc(t('goals'))}</span></div>
      <div class="bio-stat"><b>${esc(p.no ?? '—')}</b><span>${esc(t('number'))}</span></div>
    </div>
    <p class="bio-text bio-loading" id="bioText">${esc(t('bioLoading'))}</p>
    <p id="bioLink"></p>`;
  $('#modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (p.wiki) {
    const s = await wikiSummaryLocalized(p.wiki);
    const bioText = $('#bioText');
    if (!bioText) return; // el modal se cerró
    if (s) {
      bioText.classList.remove('bio-loading');
      bioText.textContent = s.extract || t('bioError');
      if (s.thumb) $('#bioPhoto').outerHTML = `<img class="bio-photo" src="${esc(s.thumb)}" alt="">`;
      if (s.url) $('#bioLink').innerHTML = `<a class="bio-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('readWiki'))}</a>`;
    } else {
      bioText.textContent = t('bioError');
    }
  } else {
    $('#bioText').textContent = t('bioError');
  }
}

function closeModal() {
  $('#modal').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ---------------- Render principal ---------------- */

function render() {
  applyI18nStatic();
  renderTzBar();
  $('#langSelect').value = state.lang;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));

  const anyLive = state.matches.some(isLive);
  $('#liveIndicator').classList.toggle('hidden', !anyLive);
  if (state.updatedAt) {
    $('#updatedAt').textContent = `${t('updated')} ${timeInTz(state.updatedAt, state.activeTz)}`;
  }

  if (state.view === 'matches') renderMatchesView();
  else if (state.view === 'groups') renderGroupsView();
  else if (state.view === 'knockout') renderKnockoutView();
  else if (state.view === 'learn') renderLearnView();
  else renderTeamsView();
}

/* ---------------- Eventos ---------------- */

function bindEvents() {
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    if (state.view !== 'teams') state.selectedTeam = null;
    render();
  }));

  $('#langSelect').addEventListener('change', (e) => {
    state.lang = e.target.value;
    localStorage.setItem('wc.lang', state.lang);
    render();
  });

  $('#tzChips').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      state.customTzs = state.customTzs.filter((z) => z !== rm.dataset.rm);
      localStorage.setItem('wc.customTzs', JSON.stringify(state.customTzs));
      if (state.activeTz === rm.dataset.rm) state.activeTz = 'Europe/Madrid';
      render();
      return;
    }
    const chip = e.target.closest('.tz-chip');
    if (chip) {
      state.activeTz = chip.dataset.tz;
      localStorage.setItem('wc.activeTz', state.activeTz);
      state.selectedDate = null; // recalcula el día según la nueva zona
      render();
    }
  });

  $('#tzAdd').addEventListener('change', (e) => {
    if (!e.target.value) return;
    state.customTzs.push(e.target.value);
    localStorage.setItem('wc.customTzs', JSON.stringify(state.customTzs));
    render();
  });

  $('#view').addEventListener('click', (e) => {
    const datePill = e.target.closest('.date-pill');
    if (datePill) { state.selectedDate = datePill.dataset.date; renderMatchesView(); return; }

    const playerCard = e.target.closest('.player-card');
    if (playerCard) { openPlayerModal(playerCard.dataset.player, playerCard.dataset.team); return; }

    if (e.target.closest('#backTeams')) { state.selectedTeam = null; render(); return; }

    const teamEl = e.target.closest('[data-team]');
    if (teamEl) {
      state.selectedTeam = teamEl.dataset.team;
      state.view = 'teams';
      render();
      window.scrollTo({ top: 0 });
      return;
    }

    const card = e.target.closest('.match-card[data-event]');
    if (card) openMatchModal(card.dataset.event);
  });

  $('#modal').addEventListener('click', (e) => {
    if (e.target.closest('.modal-close') || e.target.classList.contains('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ---------------- PWA: instalación y modo sin conexión ---------------- */

let deferredInstallPrompt = null;

function setupPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin SW la app funciona igual */ });
  }

  const btn = $('#installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    btn.classList.remove('hidden');
  });
  btn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    btn.classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => {
    btn.classList.add('hidden');
    deferredInstallPrompt = null;
  });

  // iOS no dispara beforeinstallprompt: mostramos una pista una sola vez
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const inStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (isIos && !inStandalone && !localStorage.getItem('wc.iosHintDismissed')) {
    $('#iosBannerText').innerHTML = t('iosHint');
    $('#iosBanner').classList.remove('hidden');
    $('#iosBannerClose').addEventListener('click', () => {
      $('#iosBanner').classList.add('hidden');
      localStorage.setItem('wc.iosHintDismissed', '1');
    });
  }
}

/* ---------------- Inicio ---------------- */

async function init() {
  bindEvents();
  setupPwa();
  applyI18nStatic();
  await loadStaticData();
  await loadMatches();
  render();

  setInterval(async () => {
    if (document.hidden) return;
    await loadMatches();
    // re-render sin perder el estado de navegación
    if (state.view === 'matches' || state.view === 'groups' || state.view === 'knockout') render();
    else {
      const anyLive = state.matches.some(isLive);
      $('#liveIndicator').classList.toggle('hidden', !anyLive);
      if (state.updatedAt) $('#updatedAt').textContent = `${t('updated')} ${timeInTz(state.updatedAt, state.activeTz)}`;
    }
  }, REFRESH_MS);
}

init();
