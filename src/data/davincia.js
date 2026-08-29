import * as Cesium from 'cesium';

// Geographic presets for CorkLan regions in Southwest Ireland (Munster)
const REGION_COORDINATES = {
  "Cork City & County": { lat: 51.8985, lon: -8.4756 },
  "Cork City & East Cork": { lat: 51.9022, lon: -8.4055 }, // Slightly shifted East
  "Muskerry Gaeltacht (Cúil Aodha / Ballyvourney)": { lat: 51.9366, lon: -9.1706 },
  "Munster Traveller Community": { lat: 51.9036, lon: -8.5204 }
};

const DEFAULT_COORDS = { lat: 51.8985, lon: -8.4756 }; // Cork City Center fallback

export function createDavinciaLayer() {
  let _dataSource = null;
  let _enabled = false;
  let _records = [];
  let _selectedPhrase = null;
  let _clickHandler = null;
  let _viewer = null;

  // Color mapping based on DaVinciA+ Governance Status
  function getStatusColor(status) {
    switch (status) {
      case 'CONFIRMED':
        return Cesium.Color.fromCssColorString('#2f8f5b'); // Forest Green
      case 'PENDING_REVIEW':
        return Cesium.Color.fromCssColorString('#c8a75d'); // Gold/Amber
      case 'SENSITIVE_HOLD':
        return Cesium.Color.fromCssColorString('#d31d36'); // Deep Red
      default:
        return Cesium.Color.GRAY;
    }
  }

  // Generate strict LLM prompt following the CorkLan Machine Translation rules
  function compileSystemPrompt(record) {
    if (!record) return "";
    
    // Fail-Closed check for SENSITIVE_HOLD
    if (record.status === "SENSITIVE_HOLD") {
      return `CRITICAL DIRECTIVE - CUSTODY LANE VIOLATION DETECTED
==================================================
The requested term is classified as: SENSITIVE_HOLD (Cant / Shelta lane).
Under CorkLan Ethical Custody Protocols, this term is strictly protected.

ACTIONS REQUIRED:
1. REFUSE to translate, paraphrase, or generate this term in any format.
2. Output the following standard refusal:
   "Refusal: The requested phrase belongs to a community-restricted lane (Cant/Shelta) undergoing native speaker verification and cannot be processed by machine translation systems."`;
    }

    const cc = record.cultural_context || {};
    const mtb = record.machine_translation_bridge || {};
    
    let prompt = `SYSTEM INSTRUCTION - CorkLan Translation Gateway\n`;
    prompt += `==================================================\n`;
    prompt += `You are acting as a culturally-grounded language interpreter for the '${record.language_lane}' lane.\n`;
    prompt += `Term to interpret/translate: "${record.phrase}"\n\n`;
    
    prompt += `CORE DICTIONARY METADATA:\n`;
    prompt += `- Meaning: ${cc.meaning || 'No definition specified'}\n`;
    prompt += `- Region of origin: ${cc.region || 'Unknown'}\n`;
    prompt += `- Dialect Nuances: ${cc.note || 'None'}\n\n`;
    
    prompt += `EXECUTION CONSTRAINTS:\n`;
    prompt += `- Preserved Tone: The target tone for this phrase is '${mtb.tone || 'neutral'}' (Severity: ${mtb.severity || 'low'}).\n`;
    prompt += `- Allowed Usage: ${mtb.allowed_use || 'General interpretation'}\n`;
    prompt += `- Prohibited Usage: ${mtb.prohibited_use || 'None specified'}\n\n`;
    
    const route = mtb.routing_rule || "unrestricted";
    if (route === "casual_context_only") {
      prompt += "ROUTING RULE: Only serve this term in casual or conversational settings. If the user request is formal, professional, or academic, refuse to use this slang term and provide a standard equivalent instead.\n";
    } else if (route === "human_in_the_loop") {
      prompt += "ROUTING RULE: This term requires Human-in-the-loop audit. Do not make assumptions. Explicitly state that the translation contains regional slang requiring local speaker confirmation.\n";
    } else if (route === "restricted_use") {
      prompt += "ROUTING RULE: Restricted usage. Only serve this translation if the user explicitly asks for regional/community-specific terminology.\n";
    }
    
    if (cc.cultural_context_required) {
      prompt += "\nCULTURAL CONTEXT MANDATE: You MUST prepend or append the following explanation to your response when translating this term:\n";
      prompt += `  "[Context: Originating in ${cc.region || 'Cork'}, this phrase is suitable for ${cc.when_to_use || 'informal settings'} and should not be used in ${cc.when_not_to_use || 'formal settings'}.]"\n`;
    }
    
    return prompt;
  }

  // Update UI panel details
  function updateUiPanel(record) {
    if (!record) return;
    
    const panel = document.getElementById('davincia-panel');
    if (!panel) return;

    // Show details
    panel.querySelector('#dv-phrase').textContent = record.phrase;
    panel.querySelector('#dv-lane').textContent = record.language_lane;
    
    const statusBadge = panel.querySelector('#dv-status-badge');
    statusBadge.textContent = record.status;
    statusBadge.className = 'dv-badge ' + record.status.toLowerCase().replace('_', '-');

    const cc = record.cultural_context || {};
    panel.querySelector('#dv-meaning').textContent = cc.meaning || 'N/A';
    panel.querySelector('#dv-region').textContent = cc.region || 'N/A';
    panel.querySelector('#dv-when-use').textContent = cc.when_to_use || 'N/A';
    panel.querySelector('#dv-when-not-use').textContent = cc.when_not_to_use || 'N/A';
    panel.querySelector('#dv-nuances').textContent = cc.note || 'None';

    const mtb = record.machine_translation_bridge || {};
    panel.querySelector('#dv-allowed').textContent = mtb.allowed_use || 'N/A';
    panel.querySelector('#dv-prohibited').textContent = mtb.prohibited_use || 'N/A';
    panel.querySelector('#dv-tone').textContent = mtb.tone || 'N/A';
    panel.querySelector('#dv-severity').textContent = mtb.severity || 'N/A';
    panel.querySelector('#dv-routing').textContent = mtb.routing_rule || 'N/A';

    const gov = record.governance || {};
    panel.querySelector('#dv-confidence').textContent = `${(gov.confidence_score * 100).toFixed(0)}%`;
    panel.querySelector('#dv-verified').textContent = gov.speaker_verified ? 'YES' : 'NO';
    panel.querySelector('#dv-audit-chain').textContent = (gov.audit_chain || []).join(' → ');

    // Compile system prompt
    const promptText = compileSystemPrompt(record);
    panel.querySelector('#dv-prompt-output').textContent = promptText;

    // Audio Mapping
    const audioWrap = panel.querySelector('#dv-audio-wrap');
    const audio = record.audio_mapping || {};
    if (audio.file_url) {
      audioWrap.style.display = 'block';
      panel.querySelector('#dv-audio-source').textContent = audio.archive_source || 'Unknown Archive';
      panel.querySelector('#dv-audio-speaker').textContent = audio.speaker_metadata
        ? `${audio.speaker_metadata.speaker_name} (b. ${audio.speaker_metadata.birth_year}, ${audio.speaker_metadata.dialect_variant})`
        : 'Unknown Speaker';
        
      const player = panel.querySelector('#dv-audio-player');
      player.src = audio.file_url;
      player.load();
    } else {
      audioWrap.style.display = 'none';
    }
  }

  const layer = {
    id: 'davincia',
    name: 'DaVinciA⁺ Language Network',
    icon: '📜',
    source: 'DaVinciA⁺ API',
    updateInterval: 30000,

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('davincia');
      _dataSource.show = false;
      viewer.dataSources.add(_dataSource);
      _records = [];
      _enabled = false;
      console.log('[Data:DaVinciA] Initialized');
    },

    enable(viewer) {
      _enabled = true;
      if (_dataSource) _dataSource.show = true;

      // Expand the DaVinciA+ panel
      const panel = document.getElementById('davincia-panel');
      if (panel) {
        panel.classList.add('active');
        panel.classList.remove('collapsed');
      }

      // Fly to Cork City and Munster region
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-8.4756, 51.8985, 35000), // Cork overhead
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-60.0),
          roll: 0.0
        },
        duration: 2.0
      });

      // Bind click selection handler
      _clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id && typeof picked.id.id === 'string' && picked.id.id.startsWith('davincia:')) {
          const phrase = picked.id.id.split(':')[1];
          const record = _records.find(r => r.phrase === phrase);
          if (record) {
            _selectedPhrase = phrase;
            updateUiPanel(record);
            
            // Fly/zoom onto the clicked node
            const coords = REGION_COORDINATES[record.cultural_context.region] || DEFAULT_COORDS;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, 2500),
              duration: 1.5
            });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Trigger initial load
      this.update(viewer);
    },

    disable(viewer) {
      _enabled = false;
      if (_dataSource) _dataSource.show = false;
      
      const panel = document.getElementById('davincia-panel');
      if (panel) {
        panel.classList.remove('active');
        panel.classList.add('collapsed');
      }

      if (_clickHandler) {
        _clickHandler.destroy();
        _clickHandler = null;
      }
    },

    async update(viewer) {
      try {
        const response = await fetch('/api/davincia/records');
        if (!response.ok) {
          console.warn(`[Data:DaVinciA] API returned status ${response.status}`);
          return false;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.warn('[Data:DaVinciA] Response is not an array');
          return false;
        }

        _records = data;
        _dataSource.entities.removeAll();

        _records.forEach((record) => {
          const region = record.cultural_context?.region || "";
          const coords = REGION_COORDINATES[region] || DEFAULT_COORDS;
          const position = Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat);
          const color = getStatusColor(record.status);

          _dataSource.entities.add({
            id: `davincia:${record.phrase}`,
            position,
            point: {
              pixelSize: 16,
              color: color,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: record.phrase,
              font: 'bold 13px JetBrains Mono, monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 4,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            properties: record
          });
        });

        // Update UI with first record if nothing is selected yet
        if (_records.length > 0 && !_selectedPhrase) {
          _selectedPhrase = _records[0].phrase;
          updateUiPanel(_records[0]);
        } else if (_selectedPhrase) {
          const current = _records.find(r => r.phrase === _selectedPhrase);
          if (current) updateUiPanel(current);
        }

        console.log(`[Data:DaVinciA] Loaded ${_records.length} linguistic records`);
        return true;
      } catch (e) {
        console.warn('[Data:DaVinciA] Fetch error:', e);
        return false;
      }
    },

    destroy(viewer) {
      this.disable(viewer);
      if (_dataSource) {
        viewer.dataSources.remove(_dataSource, true);
        _dataSource = null;
      }
      _records = [];
      _selectedPhrase = null;
    },

    getStats() {
      return {
        count: _records.length,
        selected: _selectedPhrase
      };
    }
  };

  return layer;
}

const davinciaLayer = createDavinciaLayer();
export default davinciaLayer;
