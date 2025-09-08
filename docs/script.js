        // --- Animação de Fundo de Campo Estelar e Nebulosa (Otimizada) ---
        const starfieldCanvas = document.getElementById('starfield');
        const ctx = starfieldCanvas.getContext('2d');

        function resizeCanvas() {
            starfieldCanvas.width = window.innerWidth;
            starfieldCanvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const stars = [];
        const numStars = 600; 
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
            // Técnica de "rastro" para otimizar o desempenho
            ctx.fillStyle = 'rgba(10, 10, 26, 0.2)'; // Fundo com transparência
            ctx.fillRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
            
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

            let simulation, link, glowLink, node, zoom, gradients;
            let graphData = { nodes: [], links: [] };
            let selectedNodeId = null; 
            
            // Variáveis de estado para o modo de edição
            let isEditing = false;
            let firstNodeSelection = null;
            let secondNodeSelection = null;
            let editingNode = null; // Para rastrear o nó sendo editado

            // Variável para armazenar a última transformação da câmera (zoom e pan)
            let lastTransform = d3.zoomIdentity;

            // Mapeamento de cores para os efeitos de brilho
            const colorMap = {
                "Fogo": "#ff4500",
                "Água": "#1e90ff",
                "Ar": "#00ffff",
                "Terra": "#7cfc00",
                "Gelo": "#00bfff",
                "Energia": "#ffff00",
                "Luz": "#fada5e",
                "Trevas": "#8a2be2",
                "Natureza": "#32cd32",
                "Dominus": "#ffd700",
                "Sangue": "#dc143c",
                "Energia Dracônica": "#ff6347"
            };

            // Dados fixos dos elementos
            let currentElements = [
                { name: "Fogo", emoji: "🔥", color: "#ff4500", description: "O elemento do fogo, representando paixão e destruição.", advantage: ["Gelo", "Terra", "Natureza"], disadvantage: ["Água", "Energia Dracônica"] },
                { name: "Água", emoji: "💧", color: "#1e90ff", description: "O elemento da água, simbolizando adaptabilidade e fluidez.", advantage: ["Fogo", "Natureza"], disadvantage: ["Ar", "Energia", "Gelo", "Dominus"] },
                { name: "Ar", emoji: "💨", color: "#00ffff", description: "O elemento do ar, associado com liberdade e rapidez.", advantage: ["Água", "Natureza"], disadvantage: ["Terra", "Energia", "Gelo"] },
                { name: "Terra", emoji: "🌍", color: "#7cfc00", description: "O elemento da terra, para estabilidade e base.", advantage: ["Ar", "Energia"], disadvantage: ["Fogo", "Natureza"] },
                { name: "Gelo", emoji: "❄️", color: "#00bfff", description: "O elemento do gelo, representando calma e preservação.", advantage: ["Água", "Ar", "Natureza", "Sangue"], disadvantage: ["Fogo", "Energia Dracônica"] },
                { name: "Energia", emoji: "⚡", color: "#ffff00", description: "O elemento de energia pura, para velocidade e poder.", advantage: ["Água", "Ar", "Sangue"], disadvantage: ["Terra", "Dominus", "Energia Dracônica"] },
                { name: "Luz", emoji: "☀️", color: "#fada5e", description: "O elemento da luz, simbolizando esperança e conhecimento.", advantage: ["Trevas", "Energia Dracônica"], disadvantage: ["Sangue"] },
                { name: "Trevas", emoji: "🌑", color: "#8a2be2", description: "O elemento da escuridão, representando mistério e o desconhecido.", advantage: ["Luz", "Sangue"], disadvantage: ["Dominus", "Energia Dracônica"] },
                { name: "Natureza", emoji: "🌳", color: "#32cd32", description: "O elemento da natureza, para vida e crescimento.", advantage: ["Terra", "Luz", "Energia Dracônica"], disadvantage: ["Fogo", "Água", "Ar", "Gelo", "Dominus", "Sangue"] },
                { name: "Dominus", emoji: "👑", color: "#ffd700", description: "O elemento de dominação, controlando todos os outros.", advantage: ["Trevas", "Água", "Natureza"], disadvantage: ["Luz", "Energia"] },
                { name: "Sangue", emoji: "🩸", color: "#dc143c", description: "O elemento de sangue, representando força vital e sacrifício.", advantage: ["Natureza", "Ar"], disadvantage: ["Gelo", "Energia", "Trevas"] },
                { name: "Energia Dracônica", emoji: "🐉", color: "#ff6347", description: "Uma energia antiga e primordial, representando poder e misticismo.", advantage: ["Fogo", "Gelo", "Energia", "Trevas"], disadvantage: ["Luz", "Natureza"] }
            ];

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
                // Salva as posições atuais dos nós antes de limpar o grafo
                const currentPositions = new Map();
                if (graphData.nodes) {
                    graphData.nodes.forEach(n => {
                        currentPositions.set(n.id, { x: n.x, y: n.y, fx: n.fx, fy: n.fy });
                    });
                }

                graphData = data;
                svg.selectAll("*").remove(); // Limpa o grafo anterior

                const g = svg.append("g");
                
                // Restaura as posições dos nós na nova simulação
                graphData.nodes.forEach(n => {
                    const pos = currentPositions.get(n.id);
                    if (pos) {
                        n.x = pos.x;
                        n.y = pos.y;
                        n.fx = pos.fx;
                        n.fy = pos.fy;
                    }
                });
                
                // --- Configuração da Simulação de Força ---
                simulation = d3.forceSimulation(graphData.nodes)
                    .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(250)) 
                    .force("charge", d3.forceManyBody().strength(-700)) 
                    .force("center", d3.forceCenter(width / 2, height / 2)) 
                    .force("collide", d3.forceCollide().radius(40)); 

                // --- Renderização de Gradientes para as Linhas ---
                const defs = g.append("defs");

                // Cria um gradiente linear para cada link
                gradients = defs.selectAll("linearGradient")
                    .data(graphData.links)
                    .enter().append("linearGradient")
                    .attr("id", d => `link-gradient-${d.source.id.replace(/\s/g, '-')}-${d.target.id.replace(/\s/g, '-')}`)
                    .attr("gradientUnits", "userSpaceOnUse");

                gradients.append("stop")
                    .attr("offset", "45%")
                    .attr("stop-color", d => d.type === 'advantage' ? "#00ff7f" : "#ff4500");
                gradients.append("stop")
                    .attr("offset", "55%")
                    .attr("stop-color", d => d.type === 'advantage' ? "#ff4500" : "#00ff7f");

                // --- Renderização dos Links de Brilho (Glow Links) ---
                glowLink = g.append("g")
                    .attr("class", "glow-links")
                    .selectAll("line")
                    .data(graphData.links)
                    .enter().append("line")
                    .attr("class", "glow-link")
                    .attr("stroke", d => `url(#link-gradient-${d.source.id.replace(/\s/g, '-')}-${d.target.id.replace(/\s/g, '-')})`);

                // --- Renderização dos Links (Conexões) ---
                link = g.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(graphData.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke-width", 1.5)
                    .attr("stroke", d => `url(#link-gradient-${d.source.id.replace(/\s/g, '-')}-${d.target.id.replace(/\s/g, '-')})`);

                // --- Renderização dos Nós (Vértices) ---
                node = g.append("g")
                    .attr("class", "nodes")
                    .selectAll("g")
                    .data(graphData.nodes)
                    .enter().append("g")
                    .attr("class", "node");

                node.append("circle")
                    .attr("r", 25)
                    .attr("fill", d => d.color || colorMap[d.name] || "#2a2a4a");

                node.append("text")
                    .attr("class", "emoji")
                    .attr("dy", ".35em")
                    .text(d => d.emoji);
                
                node.append("text")
                    .attr("class", "label")
                    .attr("y", 40)
                    .text(d => d.name);

                // --- Interatividade (Baseada em Clique e Hover) ---
                node.on("click", handleClick)
                    .on("dblclick", handleDblClick) // Adiciona o evento de duplo clique
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                svg.on("click", (event) => {
                    if (event.target.closest('.node') === null && !isEditing) {
                        deselectAll();
                    }
                });

                // --- Configuração de Zoom e Pan ---
                zoom = d3.zoom()
                    .on("zoom", (event) => {
                        // Salva a transformação em uma variável global
                        lastTransform = event.transform;
                        g.attr("transform", event.transform);
                    })
                    .filter(event => event.type !== 'dblclick');
                
                // Aplica a transformação salva ao SVG
                svg.call(zoom).call(zoom.transform, lastTransform);

                // --- Loop de Simulação (O CORAÇÃO DO MOVIMENTO) ---
                simulation.on("tick", () => {
                    glowLink
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);
                    
                    gradients
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
                document.getElementById('edit-selected-button').disabled = true; // Desabilita o botão de editar
                node.style("opacity", 1).classed("selected", false);
                node.select("circle").style("filter", "none");
                link.style("stroke-opacity", 0.4).classed("pulsing", false);
                glowLink.style("stroke-opacity", 0.1).classed("pulsing", false);
                updateLinkColors(); // Garante que os filtros de cor sejam reaplicados
            }

            // --- Manipuladores de Evento ---
            function handleClick(event, d) {
                if (isEditing) {
                    handleEditClick(event, d);
                } else {
                    if (selectedNodeId === d.id) {
                        deselectAll();
                    } else {
                        selectedNodeId = d.id;
                        document.getElementById('edit-selected-button').disabled = false; // Habilita o botão de editar

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
                        node.select("circle").style("filter", n => n.id === d.id ? `drop-shadow(0 0 15px ${n.color || colorMap[n.name] || '#ffffff'})` : "none");

                        link.style("stroke-opacity", l => {
                            const isConnected = l.source.id === d.id || l.target.id === d.id;
                            return isConnected ? 1 : 0.1;
                        }).classed("pulsing", l => l.source.id === d.id || l.target.id === d.id);
                        
                        glowLink.style("stroke-opacity", l => {
                            const isConnected = l.source.id === d.id || l.target.id === d.id;
                            return isConnected ? 0.8 : 0.1;
                        }).classed("pulsing", l => l.source.id === d.id || l.target.id === d.id);

                        updateLinkColors(); // Atualiza as cores para anular o filtro da legenda
                    }
                }
            }
            
            function handleDblClick(event, d) {
                if (!isEditing) {
                    d.fx = null;
                    d.fy = null;
                    d3.select(this).classed("pinned", false);
                    simulation.alpha(1).restart();
                    event.stopPropagation();
                }
            }
            
            // --- Funções de Animação de Partículas ---
            function createExplosion(x, y, color) {
                const g = svg.select("g");
                const particles = 50;
                const particleGroup = g.append('g').attr('transform', `translate(${x},${y})`);
                const baseColor = d3.hsl(color);

                // Shockwave effect
                particleGroup.append('circle')
                    .attr('r', 10)
                    .style('fill', 'none')
                    .style('stroke', baseColor.brighter(1.5))
                    .style('stroke-width', 3)
                    .style('opacity', 0.8)
                    .transition()
                    .duration(500)
                    .ease(d3.easeQuadOut)
                    .attr('r', 120)
                    .style('opacity', 0)
                    .remove();

                d3.range(particles).forEach(() => {
                    const angle = Math.random() * 2 * Math.PI;
                    const distance = Math.random() * 100 + 40;
                    const duration = Math.random() * 600 + 400;
                    const particleColor = baseColor.copy();
                    particleColor.h += (Math.random() - 0.5) * 40; // Variação de matiz
                    particleColor.s += (Math.random() - 0.2) * 0.3; // Variação de saturação
                    
                    // Adiciona linhas e círculos para variedade
                    if (Math.random() > 0.5) {
                        particleGroup.append('circle')
                            .attr('r', Math.random() * 5 + 2)
                            .style('fill', particleColor)
                            .style('opacity', 1)
                            .transition()
                            .duration(duration)
                            .ease(d3.easeQuadOut)
                            .attr('transform', `translate(${Math.cos(angle) * distance}, ${Math.sin(angle) * distance})`)
                            .style('opacity', 0)
                            .remove();
                    } else {
                         particleGroup.append('line')
                            .attr('x1', 0).attr('y1', 0)
                            .attr('x2', 0).attr('y2', 10 + Math.random() * 10)
                            .attr('transform', `rotate(${angle * 180 / Math.PI})`)
                            .style('stroke', particleColor)
                            .style('stroke-width', Math.random() * 2 + 1)
                            .style('opacity', 1)
                            .transition()
                            .duration(duration)
                            .ease(d3.easeQuadOut)
                            .attr('transform', `translate(${Math.cos(angle) * distance}, ${Math.sin(angle) * distance}) rotate(${angle * 180 / Math.PI})`)
                            .style('opacity', 0)
                            .remove();
                    }
                });

                // Remove o grupo após a animação mais longa possível
                setTimeout(() => particleGroup.remove(), 1000);
            }

            function createFormation(x, y, color) {
                const g = svg.select("g");
                const particles = 60;
                const particleGroup = g.append('g').attr('transform', `translate(${x},${y})`);
                const baseColor = d3.hsl(color);

                 // Flash inicial
                particleGroup.append('circle')
                    .attr('r', 80)
                    .style('fill', baseColor.brighter(2))
                    .style('opacity', 0.5)
                    .transition()
                    .duration(200)
                    .ease(d3.easeQuadOut)
                    .attr('r', 0)
                    .style('opacity', 0)
                    .remove();

                d3.range(particles).forEach(() => {
                    const angle = Math.random() * 2 * Math.PI;
                    const startDistance = Math.random() * 120 + 60;
                    const duration = Math.random() * 500 + 500;
                    const particleColor = baseColor.copy();
                    particleColor.h += (Math.random() - 0.5) * 30;

                    particleGroup.append('circle')
                        .attr('r', Math.random() * 3 + 1)
                        .style('fill', particleColor)
                        .style('opacity', 0)
                        .attr('transform', `translate(${Math.cos(angle) * startDistance}, ${Math.sin(angle) * startDistance})`)
                        .transition()
                        .duration(duration)
                        .ease(d3.easeCubicIn)
                        .attr('transform', 'translate(0,0)')
                        .style('opacity', 1)
                        .transition()
                        .duration(200)
                        .style('opacity', 0)
                        .remove();
                });

                // Remove o grupo após a animação mais longa possível
                setTimeout(() => particleGroup.remove(), 1000);
            }

            // --- Funções do Modo de Edição de Relações ---
            const instructionsMessage = document.getElementById('instructions-message');
            const editButton = document.getElementById('edit-relations-button');
            const editModal = document.getElementById('edit-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalMessage = document.getElementById('modal-message');
            const modalRemoveButton = document.getElementById('modal-remove');
            const modalAdvantageButton = document.getElementById('modal-advantage');
            const modalDisadvantageButton = document.getElementById('modal-disadvantage');
            const modalCancelButton = document.getElementById('modal-cancel');

            editButton.addEventListener('click', toggleEditMode);
            modalCancelButton.addEventListener('click', () => {
                editModal.classList.remove('visible');
                firstNodeSelection = null;
                secondNodeSelection = null;
                node.classed('editing', false);
                instructionsMessage.textContent = 'Clique no primeiro elemento';
            });
            modalAdvantageButton.addEventListener('click', () => updateRelation('advantage'));
            modalDisadvantageButton.addEventListener('click', () => updateRelation('disadvantage'));
            modalRemoveButton.addEventListener('click', () => updateRelation('remove'));

            function toggleEditMode() {
                isEditing = !isEditing;
                if (isEditing) {
                    editButton.textContent = 'Concluir Edição';
                    instructionsMessage.classList.add('visible');
                    svg.classed('editing-mode', true);
                    // A linha 'deselectAll();' foi removida para manter o estado de seleção
                } else {
                    editButton.textContent = 'Editar Relações';
                    instructionsMessage.classList.remove('visible');
                    svg.classed('editing-mode', false);
                    firstNodeSelection = null;
                    secondNodeSelection = null;
                    node.classed('editing', false);
                    editModal.classList.remove('visible');
                }
            }

            function handleEditClick(event, d) {
                if (!firstNodeSelection) {
                    firstNodeSelection = d;
                    d3.select(event.currentTarget).classed('editing', true);
                    instructionsMessage.textContent = `Clique no segundo elemento para relacionar com ${d.name}`;
                } else if (firstNodeSelection.id !== d.id) {
                    secondNodeSelection = d;
                    showEditModal();
                }
            }

            function showEditModal() {
                const source = firstNodeSelection;
                const target = secondNodeSelection;

                // Encontra a relação específica do primeiro elemento selecionado para o segundo
                const currentLink = graphData.links.find(l => 
                    l.source.id === source.id && l.target.id === target.id
                );
                
                // Redefine o estado do modal
                modalRemoveButton.style.display = 'none';
                modalAdvantageButton.disabled = false;
                modalDisadvantageButton.disabled = false;
                
                if (currentLink) {
                    // Se a relação já existe, mostra o tipo e desabilita o botão correspondente
                    modalTitle.textContent = 'Modificar Relação';
                    if (currentLink.type === 'advantage') {
                        modalMessage.textContent = `${source.name} tem VANTAGEM sobre ${target.name}.`;
                        modalAdvantageButton.disabled = true;
                    } else {
                        modalMessage.textContent = `${source.name} tem DESVANTAGEM sobre ${target.name}.`;
                        modalDisadvantageButton.disabled = true;
                    }
                    modalRemoveButton.style.display = 'inline-block';
                } else {
                    // Se a relação não existe, mostra a mensagem padrão
                    modalTitle.textContent = 'Criar Nova Relação';
                    modalMessage.textContent = `O que você quer fazer com a relação entre ${source.name} e ${target.name}?`;
                }
                
                editModal.classList.add('visible');
            }

            // Helper para atualizar os dados do elemento de forma limpa
            // `el`: O objeto de dados do elemento de origem.
            // `targetName`: O nome do elemento de destino.
            function updateElementRelation(el, targetName, type, isRemove = false) {
                // Remove a relação existente, se houver
                el.advantage = el.advantage.filter(name => name !== targetName);
                el.disadvantage = el.disadvantage.filter(name => name !== targetName);
                
                // Adiciona a nova relação, se não for para remover
                if (!isRemove) {
                    if (type === 'advantage') {
                        el.advantage.push(targetName);
                    } else if (type === 'disadvantage') {
                        el.disadvantage.push(targetName);
                    }
                }
            }

            // Atualiza a relação com base nos dois elementos selecionados.
            // A direção da relação é sempre do primeiro elemento selecionado para o segundo.
            function updateRelation(type) {
                const source = firstNodeSelection;
                const target = secondNodeSelection;

                // Encontra os objetos nos dados brutos
                const sourceEl = currentElements.find(el => el.name === source.id);
                const targetEl = currentElements.find(el => el.name === target.id);
                
                if (!sourceEl || !targetEl) return;
                
                const isRemove = type === 'remove';

                // Atualiza a relação da origem para o destino
                updateElementRelation(sourceEl, target.id, type, isRemove);
                
                // Atualiza a relação inversa (do destino para a origem)
                const inverseType = type === 'advantage' ? 'disadvantage' : (type === 'disadvantage' ? 'advantage' : 'remove');
                updateElementRelation(targetEl, source.id, inverseType, isRemove);

                // Recarrega o grafo com os dados atualizados
                const newData = processData(currentElements);
                renderGraph(newData);
                simulation.alpha(1).restart();
                
                // Reinicia o estado de edição
                firstNodeSelection = null;
                secondNodeSelection = null;
                node.classed('editing', false);
                editModal.classList.remove('visible');
                instructionsMessage.textContent = 'Relação atualizada. Clique no primeiro elemento.';
                
                // REAPLICA AS CORES APÓS ATUALIZAR O GRAFO
                updateLinkColors();
            }

            // --- Manipuladores de Arrastar ---
            function dragstarted(event, d) {
                if (!isEditing) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
            }

            function dragged(event, d) {
                if (!isEditing) {
                    d.fx = event.x;
                    d.fy = event.y;
                }
            }

            function dragended(event, d) {
                if (!isEditing) {
                    if (!event.active) simulation.alphaTarget(0);
                    d3.select(this).classed("pinned", true);
                }
            }
            
            // --- Funções de Adicionar/Editar/Deletar Elemento ---
            const addElementButton = document.getElementById('add-element-button');
            const elementModal = document.getElementById('element-modal');
            const elementModalTitle = document.getElementById('element-modal-title');
            const elementNameInput = document.getElementById('element-name');
            const elementEmojiInput = document.getElementById('element-emoji');
            const elementColorInput = document.getElementById('element-color');
            const elementDescriptionInput = document.getElementById('element-description');
            const elementSaveButton = document.getElementById('element-save-button');
            const elementDeleteButton = document.getElementById('element-delete-button');
            const elementCancelButton = document.getElementById('element-cancel-button');

            function showElementModal(mode, nodeData = null) {
                if (mode === 'edit' && nodeData) {
                    editingNode = nodeData;
                    elementModalTitle.textContent = 'Editar Elemento';
                    elementNameInput.value = nodeData.name;
                    elementEmojiInput.value = nodeData.emoji;
                    elementColorInput.value = nodeData.color || '#ffffff';
                    elementDescriptionInput.value = nodeData.description || '';
                    elementDeleteButton.style.display = 'inline-block';
                } else { // 'add' mode
                    editingNode = null;
                    elementModalTitle.textContent = 'Adicionar Novo Elemento';
                    elementNameInput.value = '';
                    elementEmojiInput.value = '';
                    elementColorInput.value = '#ffffff'; // Cor padrão para novos elementos
                    elementDescriptionInput.value = '';
                    elementDeleteButton.style.display = 'none';
                }
                elementModal.classList.add('visible');
            }

            function handleSaveElement() {
                const newName = elementNameInput.value.trim();
                const newEmoji = elementEmojiInput.value.trim();
                const newColor = elementColorInput.value;
                const newDescription = elementDescriptionInput.value.trim();

                if (!newName) {
                    console.error("O nome do elemento não pode estar vazio.");
                    // Poderíamos mostrar uma mensagem de erro na UI aqui
                    return;
                }

                if (editingNode) { // Editando um nó existente
                    if (currentElements.some(el => el.name.toLowerCase() === newName.toLowerCase() && el.name !== editingNode.name)) {
                        console.error("Já existe um elemento com este nome.");
                        return;
                    }

                    const oldName = editingNode.name;
                    const element = currentElements.find(el => el.name === oldName);
                    if (element) {
                        element.name = newName;
                        element.emoji = newEmoji;
                        element.color = newColor;
                        element.description = newDescription;

                        // Se o nome mudou, atualiza todas as referências em outros elementos
                        if (oldName !== newName) {
                            currentElements.forEach(el => {
                                el.advantage = el.advantage.map(name => name === oldName ? newName : name);
                                el.disadvantage = el.disadvantage.map(name => name === oldName ? newName : name);
                            });
                        }
                    }
                    
                    const newData = processData(currentElements);
                    renderGraph(newData);
                    simulation.alpha(1).restart();
                    elementModal.classList.remove('visible');
                    deselectAll();
                    updateLinkColors();

                } else { // Adicionando um novo nó
                    if (currentElements.some(el => el.name.toLowerCase() === newName.toLowerCase())) {
                        console.error("Já existe um elemento com este nome.");
                        return;
                    }
                    
                    // Animação de formação estelar
                    createFormation(width / 2, height / 2, newColor);

                    // Atraso para permitir que a animação seja executada antes de adicionar o nó
                    setTimeout(() => {
                        currentElements.push({
                            name: newName,
                            emoji: newEmoji,
                            color: newColor,
                            description: newDescription,
                            advantage: [],
                            disadvantage: []
                        });
                        
                        const newData = processData(currentElements);
                        renderGraph(newData);
                        simulation.alpha(1).restart();
                        deselectAll();
                        updateLinkColors();
                    }, 500);
                    
                    elementModal.classList.remove('visible');
                }
            }

            function handleDeleteElement() {
                if (!editingNode) return;

                // Encontra o nó na tela para obter sua posição para a animação
                const deletedNodeObject = graphData.nodes.find(n => n.id === editingNode.id);
                if (deletedNodeObject) {
                    createExplosion(deletedNodeObject.x, deletedNodeObject.y, deletedNodeObject.color);
                }
                
                // Atraso para permitir que a animação de explosão seja executada
                setTimeout(() => {
                    const nodeNameToDelete = editingNode.name;

                    // Remove o elemento do array principal
                    currentElements = currentElements.filter(el => el.name !== nodeNameToDelete);

                    // Remove as referências ao elemento deletado de todos os outros elementos
                    currentElements.forEach(el => {
                        el.advantage = el.advantage.filter(name => name !== nodeNameToDelete);
                        el.disadvantage = el.disadvantage.filter(name => name !== nodeNameToDelete);
                    });

                    // Renderiza novamente o grafo
                    const newData = processData(currentElements);
                    renderGraph(newData);
                    simulation.alpha(1).restart();
                    deselectAll();
                    updateLinkColors();
                    editingNode = null; // Limpa o nó de edição
                }, 400);

                // Fecha o modal imediatamente para dar feedback ao usuário
                elementModal.classList.remove('visible');
            }

            // --- Lógica do Botão de Controle ---
            document.getElementById('edit-selected-button').addEventListener('click', () => {
                if (selectedNodeId) {
                    const selectedNodeData = graphData.nodes.find(n => n.id === selectedNodeId);
                    if (selectedNodeData) {
                        showElementModal('edit', selectedNodeData);
                    }
                }
            });

            document.getElementById('reset-button').addEventListener('click', () => {
                graphData.nodes.forEach(n => {
                    n.fx = null;
                    n.fy = null;
                });
                node.classed("pinned", false);
                simulation.alpha(1).restart();
                // Redefine a transformação para a identidade padrão e a aplica
                lastTransform = d3.zoomIdentity;
                svg.transition().duration(750).call(zoom.transform, lastTransform);
                deselectAll();
                document.querySelectorAll('.legend-item').forEach(item => {
                    item.classList.remove('inactive');
                });
                // Garante que todas as conexões voltem ao normal
                link.classed("filtered", false);
                glowLink.classed("filtered", false);
            });
            
            // --- Funcionalidade de Busca ---
            const searchForm = document.getElementById('search-form');
            const searchInput = document.getElementById('search-input');
            const datalist = document.getElementById('elements-datalist');

            function updateDatalist() {
                datalist.innerHTML = ''; // Limpa as opções antigas
                currentElements.forEach(el => {
                    const option = document.createElement('option');
                    option.value = el.name;
                    datalist.appendChild(option);
                });
            }

            searchForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const query = searchInput.value.trim();
                if (!query) return;
                
                const targetNode = graphData.nodes.find(n => n.name.toLowerCase() === query.toLowerCase());

                if (targetNode) {
                    const scale = 1.5; // Nível de zoom desejado
                    const x = width / 2 - targetNode.x * scale;
                    const y = height / 2 - targetNode.y * scale;

                    const transform = d3.zoomIdentity.translate(x, y).scale(scale);
                    
                    svg.transition()
                        .duration(1000)
                        .call(zoom.transform, transform);
                    
                    // Destaca o nó encontrado
                    setTimeout(() => {
                        deselectAll(); // Limpa seleções anteriores
                        handleClick(null, targetNode); // Simula um clique para destacar
                    }, 1000);

                    searchInput.value = '';
                } else {
                    // Feedback visual se o elemento não for encontrado
                    searchInput.style.transition = 'transform 0.1s ease-in-out';
                    searchInput.style.transform = 'translateX(-5px)';
                    setTimeout(() => searchInput.style.transform = 'translateX(5px)', 100);
                    setTimeout(() => searchInput.style.transform = 'translateX(-5px)', 200);
                    setTimeout(() => searchInput.style.transform = 'translateX(0)', 300);
                }
            });

            // --- Funcionalidade de Importar e Exportar ---
            document.getElementById('export-button').addEventListener('click', () => {
                const jsonData = JSON.stringify(currentElements, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'element_graph.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

            document.getElementById('import-button').addEventListener('click', () => {
                document.getElementById('file-input').click();
            });

            document.getElementById('file-input').addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (Array.isArray(importedData)) {
                            currentElements = importedData;
                            const newData = processData(currentElements);
                            renderGraph(newData);
                            simulation.alpha(1).restart();
                            deselectAll();
                            updateDatalist(); // Atualiza a lista de busca
                        } else {
                            console.error("Formato de arquivo JSON inválido. Esperado um array de elementos.");
                        }
                    } catch (error) {
                        console.error("Erro ao ler ou analisar o arquivo JSON:", error);
                    }
                };
                reader.readAsText(file);
            });

            // --- Funcionalidade da Legenda (Corrigida) ---
            document.querySelectorAll('.legend-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const allLegendItems = document.querySelectorAll('.legend-item');
                    // Verifica se algum item já está inativo
                    const isAnyInactive = Array.from(allLegendItems).some(el => el.classList.contains('inactive'));

                    if (isAnyInactive) {
                        // Se sim, remove a classe 'inactive' de todos
                        allLegendItems.forEach(el => el.classList.remove('inactive'));
                    } else {
                        // Se não, adiciona a classe 'inactive' a todos
                        allLegendItems.forEach(el => el.classList.add('inactive'));
                    }

                    // Atualiza a cor das linhas com base no estado atual da legenda
                    updateLinkColors();
                });
            });

            function updateLinkColors() {
                // Encontra todos os tipos de linha que devem ficar cinza (filtrados)
                const inactiveTypes = new Set();
                document.querySelectorAll('.legend-item.inactive').forEach(item => {
                    inactiveTypes.add(item.dataset.type);
                });
            
                const isNodeSelected = selectedNodeId !== null;
            
                // Aplica a classe "filtered" (cinza)
                link.classed("filtered", d => {
                    // Se um nó está selecionado, suas conexões NUNCA são filtradas
                    if (isNodeSelected && (d.source.id === selectedNodeId || d.target.id === selectedNodeId)) {
                        return false;
                    }
                    // Caso contrário, filtra com base na legenda
                    return inactiveTypes.has(d.type);
                });
            
                glowLink.classed("filtered", d => {
                     // Se um nó está selecionado, suas conexões NUNCA são filtradas
                    if (isNodeSelected && (d.source.id === selectedNodeId || d.target.id === selectedNodeId)) {
                        return false;
                    }
                    // Caso contrário, filtra com base na legenda
                    return inactiveTypes.has(d.type);
                });
            }

            // --- Listeners de Eventos dos Modais ---
            addElementButton.addEventListener('click', () => showElementModal('add'));
            elementSaveButton.addEventListener('click', handleSaveElement);
            elementDeleteButton.addEventListener('click', handleDeleteElement);
            elementCancelButton.addEventListener('click', () => {
                elementModal.classList.remove('visible');
                editingNode = null;
            });


            // --- Carregamento Inicial ---
            const initialData = processData(currentElements);
            renderGraph(initialData);
            updateDatalist();

            window.addEventListener('resize', () => {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
                simulation.alpha(0.3).restart();
            });
        });
