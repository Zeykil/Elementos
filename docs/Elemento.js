        // --- Animação de Fundo de Campo Estelar e Nebulosa ---
        const starfieldCanvas = document.getElementById('starfield');
        const ctx = starfieldCanvas.getContext('2d');

        function resizeCanvas() {
            starfieldCanvas.width = window.innerWidth;
            starfieldCanvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const stars = [];
        const numStars = 500;
        const nebulae = [];
        const numNebulae = 5;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * starfieldCanvas.width,
                y: Math.random() * starfieldCanvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random(),
                speed: Math.random() * 0.2 + 0.1
            });
        }
        
        for (let i = 0; i < numNebulae; i++) {
            nebulae.push({
                x: Math.random() * starfieldCanvas.width,
                y: Math.random() * starfieldCanvas.height,
                radius: Math.random() * 300 + 200,
                color: `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 255, 0.05)`, // Azul claro, roxo
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1
            });
        }

        function drawStarfield() {
            ctx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
            
            const gradient = ctx.createRadialGradient(
                starfieldCanvas.width / 2, starfieldCanvas.height / 2, 0,
                starfieldCanvas.width / 2, starfieldCanvas.height / 2, Math.max(starfieldCanvas.width, starfieldCanvas.height) / 1.5
            );
            gradient.addColorStop(0, 'rgba(30, 0, 50, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 20, 0.6)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);

            nebulae.forEach(nebula => {
                ctx.beginPath();
                ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
                ctx.fillStyle = nebula.color;
                ctx.filter = 'blur(20px)';
                ctx.fill();

                nebula.x += nebula.speedX;
                nebula.y += nebula.speedY;

                if (nebula.x > starfieldCanvas.width + nebula.radius) nebula.x = -nebula.radius;
                if (nebula.x < -nebula.radius) nebula.x = starfieldCanvas.width + nebula.radius;
                if (nebula.y > starfieldCanvas.height + nebula.radius) nebula.y = -nebula.radius;
                if (nebula.y < -nebula.radius) nebula.y = starfieldCanvas.height + nebula.radius;
            });
            ctx.filter = 'none';

            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();

                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = starfieldCanvas.height;
                    star.x = Math.random() * starfieldCanvas.width;
                }
            });
            requestAnimationFrame(drawStarfield);
        }
        drawStarfield();

        // --- Visualização do Grafo D3 ---
        document.addEventListener('DOMContentLoaded', () => {
            const svg = d3.select("#graph");
            const width = window.innerWidth;
            const height = window.innerHeight;

            let simulation, link, node, zoom;
            let graphData = { nodes: [], links: [] };
            let selectedNodeId = null; // Rastreia o nó atualmente selecionado
            
            // Dados fixos dos elementos com a nova propriedade 'color'
// Dados fixos dos elementos com a nova propriedade 'color'
let currentElements = [
  { name: "Fogo", emoji: "🔥", color: "#ff4500",
    description: "O elemento do fogo, representando paixão e destruição.",
    advantage: ["Gelo","Terra","Natureza"], disadvantage: ["Água"] },

  { name: "Água", emoji: "🌊", color: "#1e90ff",
    description: "O elemento da água, simbolizando adaptabilidade e fluidez.",
    advantage: ["Fogo","Natureza"], disadvantage: ["Ar","Energia","Gelo","Dominus"] },

  { name: "Ar", emoji: "🌪️", color: "#00ffff",
    description: "O elemento do ar, associado com liberdade e rapidez.",
    advantage: ["Água","Natureza"], disadvantage: ["Terra","Energia","Gelo"] },

  { name: "Terra", emoji: "⛰️", color: "#7cfc00",
    description: "O elemento da terra, para estabilidade e base.",
    advantage: ["Ar","Energia"], disadvantage: ["Fogo","Natureza"] },

  { name: "Gelo", emoji: "❄️", color: "#00bfff",
    description: "O elemento do gelo, representando calma e preservação.",
    advantage: ["Água","Ar","Natureza","Sangue"], disadvantage: ["Fogo"] },

  { name: "Energia", emoji: "⚡", color: "#ffff00",
    description: "O elemento de energia pura, para velocidade e poder.",
    advantage: ["Água","Ar","Sangue"], disadvantage: ["Terra","Dominus"] },

  { name: "Luz", emoji: "☀️", color: "#fada5e",
    description: "O elemento da luz, simbolizando esperança e conhecimento.",
    advantage: ["Trevas"], disadvantage: ["Sangue"] },

  { name: "Trevas", emoji: "🌑", color: "#8a2be2",
    description: "O elemento da escuridão, representando mistério e o desconhecido.",
    advantage: ["Luz","Sangue"], disadvantage: ["Dominus"] },

  { name: "Natureza", emoji: "🌿", color: "#32cd32",
    description: "O elemento da natureza, para vida e crescimento.",
    advantage: ["Terra","Luz"], disadvantage: ["Fogo","Água","Ar","Gelo","Dominus","Sangue"] },

  { name: "Energia Dracônica", emoji: "🐉", color: "#8b0000",
    description: "O elemento de energia dracônica, crua e poderosa.",
    advantage: ["Fogo","Gelo","Energia","Trevas"], disadvantage: ["Luz","Natureza"] },

  { name: "Dominus", emoji: "⚫", color: "#8B0040",
    description: "O elemento de dominação, controlando todos os outros.",
    advantage: ["Trevas","Água","Natureza"], disadvantage: ["Luz","Energia"] },

  { name: "Sangue", emoji: "🩸", color: "#dc143c",
    description: "O elemento de sangue, representando força vital e sacrifício.",
    advantage: ["Natureza","Luz"], disadvantage: ["Gelo","Energia","Trevas"] }
];



            // --- Gerenciamento dos Dados do Grafo ---

            // Função para processar os dados brutos para o formato compatível com D3
            function processData(elements) {
                const nodes = elements.map(el => ({ id: el.name, ...el }));
                const links = [];
                elements.forEach(sourceEl => {
                    sourceEl.advantage.forEach(targetName => {
                        if (elements.find(el => el.name === targetName)) {
                            links.push({ source: sourceEl.name, target: targetName, type: 'advantage' });
                        }
                    });
                    sourceEl.disadvantage.forEach(targetName => {
                        if (elements.find(el => el.name === targetName)) {
                            links.push({ source: sourceEl.name, target: targetName, type: 'disadvantage' });
                        }
                    });
                });
                return { nodes, links };
            }

            // Função para inicializar e renderizar o grafo
            function renderGraph(data) {
                graphData = data;
                svg.selectAll("*").remove(); // Limpa o grafo anterior

                const g = svg.append("g");
                
                // --- Configuração da Simulação de Força ---
                simulation = d3.forceSimulation(graphData.nodes)
                    .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(200))
                    .force("charge", d3.forceManyBody().strength(-500))
                    .force("center", d3.forceCenter(width / 2, height / 2))
                    .force("collide", d3.forceCollide().radius(40));

                // --- Renderização dos Links (Conexões) ---
                link = g.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(graphData.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-width", 2)
                    .attr("stroke", d => d.type === 'advantage' ? "#00ff7f" : "#ff4500");

                // --- Renderização dos Nós (Vértices) ---
                node = g.append("g")
                    .attr("class", "nodes")
                    .selectAll("g")
                    .data(graphData.nodes)
                    .enter().append("g")
                    .attr("class", "node");

                node.append("circle")
                    .attr("r", 25)
                    .attr("fill", d => d.color); // Usa a cor do objeto do nó

                node.append("text")
                    .attr("class", "emoji")
                    .attr("dy", ".35em")
                    .text(d => d.emoji);
                
                node.append("text")
                    .attr("class", "label")
                    .attr("y", 40)
                    .text(d => d.name);

                // --- Interatividade ---
                node.on("click", handleClick)
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));
                
                svg.on("click", (event) => {
                    if (event.target.closest('.node') === null) {
                        deselectAll();
                    }
                });

                zoom = d3.zoom()
                    .on("zoom", (event) => {
                        g.attr("transform", event.transform);
                    })
                    .filter(event => event.type !== 'dblclick');
                svg.call(zoom);

                simulation.on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node.attr("transform", d => `translate(${d.x},${d.y})`);
                });
            }

            // --- Funções de Seleção e Desseleção ---
            function deselectAll() {
                selectedNodeId = null;
                node.style("opacity", 1).classed("selected", false);
                node.select("circle").style("filter", "none");
                link.style("stroke-opacity", 0.4)
                    .style("filter", "none")
                    .classed("pulsing", false);
                
                document.getElementById('edit-button').disabled = true;
                document.getElementById('delete-button').disabled = true;
                closeEditorPanel();
            }

            // --- Manipuladores de Evento ---

            function handleClick(event, d) {
                if (selectedNodeId === d.id) {
                    // Clicou no mesmo nó, deseleciona
                    deselectAll();
                } else {
                    // Seleciona um novo nó
                    selectedNodeId = d.id;
                    const connectedNodeIds = new Set();
                    connectedNodeIds.add(d.id);
                    graphData.links.forEach(l => {
                        if (l.source.id === d.id || l.target.id === d.id) {
                            connectedNodeIds.add(l.source.id);
                            connectedNodeIds.add(l.target.id);
                        }
                    });
                    
                    node.style("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.2);
                    node.classed("selected", n => n.id === d.id);
                    // Usa a nova propriedade 'color' para o brilho do filtro
                    node.select("circle").style("filter", n => n.id === d.id ? `drop-shadow(0 0 15px ${n.color})` : "none");

                    link.style("stroke-opacity", l => {
                        const isConnected = l.source.id === d.id || l.target.id === d.id;
                        return isConnected ? 1 : 0.1;
                    }).classed("pulsing", l => l.source.id === d.id || l.target.id === d.id)
                      .style("filter", l => {
                          if (l.source.id === d.id || l.target.id === d.id) {
                              const color = l.type === 'advantage' ? '#00ff7f' : '#ff4500';
                              return `drop-shadow(0 0 5px ${color})`;
                          }
                          return "none";
                      });
                    
                    document.getElementById('edit-button').disabled = false;
                    document.getElementById('delete-button').disabled = false;
                }
            }
            
            // --- Manipuladores de Arrasto ---
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            
            // --- Lógica dos Botões de Controle ---
            document.getElementById('reset-button').addEventListener('click', () => {
                simulation.alpha(1).restart();
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                deselectAll();
            });
            
            document.getElementById('add-element-button').addEventListener('click', () => {
                openEditorPanel();
            });
            
            document.getElementById('edit-button').addEventListener('click', () => {
                if (selectedNodeId) {
                    const elementToEdit = currentElements.find(el => el.name === selectedNodeId);
                    if (elementToEdit) {
                        openEditorPanel(elementToEdit);
                    }
                }
            });
            
            document.getElementById('delete-button').addEventListener('click', () => {
                if (selectedNodeId) {
                    const elementToDelete = currentElements.find(el => el.name === selectedNodeId);
                    if (elementToDelete) {
                        showDeleteModal(elementToDelete);
                    }
                }
            });

            document.getElementById('export-json-button').addEventListener('click', exportData);
            document.getElementById('import-json').addEventListener('change', importData);

            // --- Funcionalidade da Legenda ---
            document.querySelectorAll('.legend-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const type = item.dataset.type;
                    const isActive = item.classList.toggle('inactive');
                    
                    link.style("stroke-opacity", l => {
                        const anyActive = document.querySelector('.legend-item:not(.inactive)');
                        if (!anyActive) return 0.4;
                        const isAdvantageInactive = document.querySelector('.legend-item[data-type="advantage"]').classList.contains('inactive');
                        const isDisadvantageInactive = document.querySelector('.legend-item[data-type="disadvantage"]').classList.contains('inactive');

                        if (isAdvantageInactive && isDisadvantageInactive) {
                            return 0;
                        } else if (isAdvantageInactive) {
                            return l.type === 'advantage' ? 0 : 1;
                        } else if (isDisadvantageInactive) {
                            return l.type === 'disadvantage' ? 0 : 1;
                        }
                        return 1;
                    });
                });
            });

            // --- Lógica de Painel de Edição e Modais ---
            const editorPanel = document.getElementById('editor-panel');
            const deleteModal = document.getElementById('delete-modal');
            const saveButton = document.getElementById('save-button');
            const closePanelButton = document.getElementById('close-panel-button');
            const confirmDeleteButton = document.getElementById('confirm-delete-button');
            const cancelDeleteButton = document.getElementById('cancel-delete-button');
            
            let elementToDelete = null;

            function openModal(modal) {
                modal.style.display = 'flex';
            }

            function closeModal(modal) {
                modal.style.display = 'none';
            }
            
            // Abre o painel de edição
            function openEditorPanel(element = null) {
                const panelTitle = document.getElementById('panel-title');
                const idInput = document.getElementById('element-id-input');
                const nameInput = document.getElementById('element-name-input');
                const emojiInput = document.getElementById('element-emoji-input');
                const colorInput = document.getElementById('element-color-input'); // Novo input de cor
                
                // Limpa quaisquer valores e seleções anteriores
                idInput.value = '';
                nameInput.value = '';
                emojiInput.value = '';
                colorInput.value = '#FFFFFF'; // Define a cor padrão para um novo elemento
                
                populateCheckboxes(currentElements, element);
                
                idInput.value = element ? element.name : '';
                nameInput.value = element ? element.name : '';
                emojiInput.value = element ? element.emoji : '';
                colorInput.value = element ? element.color : '#FFFFFF'; // Preenche a cor do elemento a ser editado
                
                panelTitle.textContent = element ? `Editar Elemento: ${element.name}` : 'Adicionar Novo Elemento';
                
                // Pré-seleciona os checkboxes existentes
                if (element) {
                    element.advantage.forEach(name => {
                        const checkbox = document.getElementById(`advantage-${name}`);
                        if (checkbox) checkbox.checked = true;
                    });
                    element.disadvantage.forEach(name => {
                        const checkbox = document.getElementById(`disadvantage-${name}`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                
                editorPanel.classList.add('open');
            }
            
            // Fecha o painel de edição
            function closeEditorPanel() {
                editorPanel.classList.remove('open');
            }
            
            // Cria e preenche os checkboxes
            function populateCheckboxes(elements, currentElement = null) {
                const advantageContainer = document.getElementById('advantage-checkboxes');
                const disadvantageContainer = document.getElementById('disadvantage-checkboxes');
                
                advantageContainer.innerHTML = '';
                disadvantageContainer.innerHTML = '';
                
                elements.forEach(el => {
                    if (currentElement && el.name === currentElement.name) return;
                    
                    const createCheckbox = (id, name, emoji) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.classList.add('checkbox-item');

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = id;
                        checkbox.value = name;
                        
                        const label = document.createElement('label');
                        label.htmlFor = id;
                        label.textContent = `${emoji} ${name}`;
                        
                        itemDiv.appendChild(checkbox);
                        itemDiv.appendChild(label);
                        return itemDiv;
                    };
                    
                    advantageContainer.appendChild(createCheckbox(`advantage-${el.name}`, el.name, el.emoji));
                    disadvantageContainer.appendChild(createCheckbox(`disadvantage-${el.name}`, el.name, el.emoji));
                });
            }

            // Lida com o salvamento do elemento
            saveButton.addEventListener('click', () => {
                const id = document.getElementById('element-id-input').value;
                const name = document.getElementById('element-name-input').value.trim();
                const emoji = document.getElementById('element-emoji-input').value.trim();
                const color = document.getElementById('element-color-input').value; // Pega o valor do novo input de cor
                
                const advantageCheckboxes = document.querySelectorAll('#advantage-checkboxes input[type="checkbox"]:checked');
                const disadvantageCheckboxes = document.querySelectorAll('#disadvantage-checkboxes input[type="checkbox"]:checked');

                const advantage = Array.from(advantageCheckboxes).map(checkbox => checkbox.value);
                const disadvantage = Array.from(disadvantageCheckboxes).map(checkbox => checkbox.value);
                
                if (!name) {
                    console.error("Nome do elemento não pode ser vazio.");
                    return;
                }
                
                if (id) {
                    // Edita elemento existente
                    const index = currentElements.findIndex(el => el.name === id);
                    if (index !== -1) {
                        currentElements[index] = { name, emoji, color, advantage, disadvantage };
                    }
                } else {
                    // Adiciona novo elemento
                    const newElement = { name, emoji, color, advantage, disadvantage };
                    currentElements.push(newElement);
                }
                
                updateGraph();
                closeEditorPanel();
            });
            
            // Lida com o fechamento do painel
            closePanelButton.addEventListener('click', closeEditorPanel);
            
            // Mostra o modal de confirmação de exclusão
            function showDeleteModal(element) {
                elementToDelete = element;
                const modalText = document.getElementById('delete-modal-text');
                modalText.textContent = `Tem certeza que deseja apagar o elemento ${element.name}?`;
                openModal(deleteModal);
            }
            
            // Lida com a exclusão
            confirmDeleteButton.addEventListener('click', () => {
                if (elementToDelete) {
                    const nodeToRemove = d3.select(node.nodes().find(n => d3.select(n).datum().id === elementToDelete.name));
                    
                    nodeToRemove.classed("exploding", true).on("animationend", () => {
                        nodeToRemove.remove();
                    });
                    
                    const explosionCenter = { x: elementToDelete.x, y: elementToDelete.y };
                    const explosionStrength = 15000; // Força de repulsão aumentada
                    simulation.nodes().forEach(n => {
                        if (n.id !== elementToDelete.name) {
                            const dx = n.x - explosionCenter.x;
                            const dy = n.y - explosionCenter.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance > 0) {
                                const force = explosionStrength / (distance * distance);
                                n.vx += dx / distance * force;
                                n.vy += dy / distance * force;
                            }
                        }
                    });
                    
                    currentElements = currentElements.filter(el => el.name !== elementToDelete.name);
                    updateGraph();
                    closeModal(deleteModal);
                    deselectAll();
                    elementToDelete = null;
                }
            });
            
            cancelDeleteButton.addEventListener('click', () => {
                closeModal(deleteModal);
                elementToDelete = null;
            });
            
            // Função para atualizar o grafo após uma mudança nos dados
            function updateGraph() {
                const data = processData(currentElements);
                renderGraph(data);
            }
            
            // --- Funções de Importação e Exportação JSON ---
            function exportData() {
                const dataStr = JSON.stringify(currentElements, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "elementos.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            function importData(event) {
                const file = event.target.files[0];
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (Array.isArray(importedData)) {
                            currentElements = importedData;
                            updateGraph();
                        } else {
                            console.error("Formato JSON inválido. Esperado um array de elementos.");
                        }
                    } catch (error) {
                        console.error("Erro ao analisar o arquivo JSON:", error);
                    }
                };
                reader.readAsText(file);
            }

            // --- Carregamento Inicial ---
            updateGraph();

            // Ajusta o centro do grafo ao redimensionar a janela
            window.addEventListener('resize', () => {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
                simulation.alpha(0.3).restart();
            });
        });

        // --- depois de criar const g = svg.append("g"); adicione as setas ---
const defs = svg.append("defs");

defs.append("marker")
  .attr("id", "arrow-adv").attr("viewBox","0 0 10 10")
  .attr("refX", 12).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6)
  .attr("orient","auto-start-reverse")
  .append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("fill","#00ff7f");

defs.append("marker")
  .attr("id", "arrow-dis").attr("viewBox","0 0 10 10")
  .attr("refX", 12).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6)
  .attr("orient","auto-start-reverse")
  .append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("fill","#ff4500");

// --- Renderização dos Links (agora como <path>) ---
link = g.append("g")
  .attr("class", "links")
  .selectAll("path")
  .data(graphData.links)
  .enter().append("path")
  .attr("class", "link")
  .attr("fill", "none")
  .attr("stroke-width", 2)
  .attr("stroke", d => d.type === 'advantage' ? "#00ff7f" : "#ff4500")
  .attr("marker-end", d => d.type === 'advantage' ? "url(#arrow-adv)" : "url(#arrow-dis)");

// --- Renderização dos Nós permanece igual ---

// --- Curvatura quando há ligação nos dois sentidos ---
(function addCurvesForOppositeDirections() {
  const pair = {};
  graphData.links.forEach(l => {
    const key = [l.source.id || l.source, l.target.id || l.target].sort().join("|");
    pair[key] = (pair[key] || 0) + 1;
  });
  graphData.links.forEach(l => {
    const key = [l.source.id || l.source, l.target.id || l.target].sort().join("|");
    l.curve = pair[key] > 1 ? (l.source.id || l.source) < (l.target.id || l.target) ? 1 : -1 : 0;
  });
})();

// --- Função utilitária para desenhar o path (reta ou curva) ---
function linkPath(d) {
  const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
  if (!d.curve) return `M ${sx},${sy} L ${tx},${ty}`;
  const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy) || 1;
  const mx = (sx + tx) / 2, my = (sy + ty) / 2;
  const offset = 30 * d.curve;
  const cx = mx - (dy / dist) * offset;
  const cy = my + (dx / dist) * offset;
  return `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;
}

// --- No tick, atualize paths e nós ---
simulation.on("tick", () => {
  link.attr("d", linkPath);
  node.attr("transform", d => `translate(${d.x},${d.y})`);
});
