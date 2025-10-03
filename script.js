let tasks = [];
let scene, camera, renderer, crystal, crystalGroup;
let animationId;

function initThreeJS() {
    const container = document.getElementById('crystal-container');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0.1);
    container.appendChild(renderer.domElement);

    crystalGroup = new THREE.Group();
    scene.add(crystalGroup);

    createCrystal();

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 8;

    animate();
}

function createCrystal() {
    crystalGroup.clear();

    const completionRate = calculateOverallCompletion();

    createGeometricCrystal(completionRate);

    if (completionRate > 20) {
        createEnergyRings(completionRate);
    }

    if (completionRate > 40) {
        createFloatingParticles(completionRate);
    }

    if (completionRate > 60) {
        createLightBeam(completionRate);
    }

    if (completionRate > 80) {
        createAuraEffect(completionRate);
    }
}

function createGeometricCrystal(completionRate) {
    const crystalParts = [];

    const coreGeometry = new THREE.OctahedronGeometry(1);
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.9, 1, 0.3 + completionRate / 200),
        shininess: 100,
        transparent: true,
        opacity: 0.9,
        emissive: new THREE.Color().setHSL(0.9, 0.8, completionRate / 400)
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    crystalParts.push(core);

    if (completionRate > 25) {
        const ringGeometry = new THREE.DodecahedronGeometry(1.5);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.9, 0.8, 0.4),
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        crystalParts.push(ring);
    }

    if (completionRate > 50) {
        const frameGeometry = new THREE.IcosahedronGeometry(2);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff1b8d,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        crystalParts.push(frame);
    }

    const baseScale = 0.8 + (completionRate / 100) * 1.2;
    crystalParts.forEach((part, index) => {
        const scale = baseScale * (1 - index * 0.1);
        part.scale.set(scale, scale, scale);
        part.userData = { rotationSpeed: (index + 1) * 0.01 };
        crystalGroup.add(part);
    });

    crystal = core;
}

function createEnergyRings(completionRate) {
    const ringCount = Math.floor(completionRate / 20);

    for (let i = 0; i < ringCount; i++) {
        const ringGeometry = new THREE.TorusGeometry(2.5 + i * 0.5, 0.1, 8, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.9 - i * 0.1, 1, 0.6),
            transparent: true,
            opacity: 0.4 - i * 0.1
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ring.userData = {
            rotationSpeed: (i + 1) * 0.02,
            axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
        };

        crystalGroup.add(ring);
    }
}

function createFloatingParticles(completionRate) {
    const particleCount = Math.floor(completionRate * 2);
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);

    for (let i = 0; i < particleCount; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.9, 1, Math.random() * 0.5 + 0.5),
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        const radius = 3 + Math.random() * 2;
        const angle = (i / particleCount) * Math.PI * 2;

        particle.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 4,
            Math.sin(angle) * radius
        );

        particle.userData = {
            orbitRadius: radius,
            orbitSpeed: 0.01 + Math.random() * 0.02,
            verticalSpeed: 0.005 + Math.random() * 0.01,
            angle: angle
        };

        crystalGroup.add(particle);
    }
}

function createLightBeam(completionRate) {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.5, 8, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0xff1b8d,
        transparent: true,
        opacity: 0.6,
        emissive: new THREE.Color(0xff1b8d).multiplyScalar(0.3)
    });

    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = 4;
    beam.userData = { pulse: 0 };

    crystalGroup.add(beam);
}

function createAuraEffect(completionRate) {
    for (let i = 0; i < 3; i++) {
        const auraGeometry = new THREE.SphereGeometry(3 + i * 0.5, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.9, 1, 0.3),
            transparent: true,
            opacity: 0.1 - i * 0.02,
            side: THREE.DoubleSide
        });

        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.userData = {
            pulseSpeed: 0.02 + i * 0.01,
            pulseOffset: i * Math.PI / 3
        };

        crystalGroup.add(aura);
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);

    if (crystalGroup) {
        const time = Date.now() * 0.001;

        crystalGroup.children.forEach((child, index) => {
            if (child.userData.rotationSpeed) {
                child.rotation.y += child.userData.rotationSpeed;
                child.rotation.x += child.userData.rotationSpeed * 0.5;

                if (child.userData.axis) {
                    child.rotateOnAxis(child.userData.axis, child.userData.rotationSpeed);
                }
            }

            if (child.userData.orbitRadius) {
                child.userData.angle += child.userData.orbitSpeed;
                child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
                child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
                child.position.y += Math.sin(time * child.userData.verticalSpeed) * 0.02;
            }

            if (child.userData.pulse !== undefined) {
                child.userData.pulse += 0.1;
                const pulseFactor = (Math.sin(child.userData.pulse) + 1) * 0.5;
                child.material.opacity = 0.3 + pulseFactor * 0.5;
                child.scale.setScalar(0.8 + pulseFactor * 0.4);
            }

            if (child.userData.pulseSpeed) {
                const pulse = Math.sin(time * child.userData.pulseSpeed + child.userData.pulseOffset);
                const scale = 1 + pulse * 0.1;
                child.scale.setScalar(scale);
                child.material.opacity = child.material.opacity * (0.8 + pulse * 0.2);
            }
        });

        crystalGroup.position.y = Math.sin(time * 0.5) * 0.1;
        crystalGroup.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

function addTask() {
    const taskName = document.getElementById('taskName').value;
    const subtasksText = document.getElementById('subtasks').value;

    if (!taskName) return;

    const subtasks = subtasksText.split('\n')
        .filter(st => st.trim())
        .map(st => ({ text: st.trim(), completed: false }));

    const task = {
        id: Date.now(),
        name: taskName,
        subtasks: subtasks,
        completed: false
    };

    tasks.push(task);

    document.getElementById('taskName').value = '';
    document.getElementById('subtasks').value = '';

    updateTaskList();
    updateStats();
    createCrystal();
}

function toggleSubtask(taskId, subtaskIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const wasCompleted = task.completed;
        task.completed = completedSubtasks === task.subtasks.length;

        if (!wasCompleted && task.completed) {
            showAchievement(`🎉 "${task.name}" 完了!!`);
        }

        updateTaskList();
        updateStats();
        createCrystal();
    }
}

function calculateOverallCompletion() {
    if (tasks.length === 0) return 0;

    let totalSubtasks = 0;
    let completedSubtasks = 0;

    tasks.forEach(task => {
        totalSubtasks += task.subtasks.length;
        completedSubtasks += task.subtasks.filter(st => st.completed).length;
    });

    return totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.name}</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div style="margin-top: 5px; font-size: 0.9em;">
                ${completedSubtasks}/${task.subtasks.length} 完了 (${Math.round(progress)}%)
            </div>
            <div class="subtasks">
                ${task.subtasks.map((st, index) => `
                    <div class="subtask">
                        <input type="checkbox" ${st.completed ? 'checked' : ''} 
                               onchange="toggleSubtask(${task.id}, ${index})">
                        <span style="${st.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${st.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

function updateStats() {
    const completionRate = calculateOverallCompletion();
    const completedTasks = tasks.filter(t => t.completed).length;

    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('completedTasks').textContent = `${completedTasks}/${tasks.length}`;
}

function showAchievement(message) {
    const achievement = document.getElementById('achievementMessage');
    achievement.textContent = message;
    achievement.style.display = 'block';

    setTimeout(() => {
        achievement.style.display = 'none';
    }, 3000);
}

window.addEventListener('resize', () => {
    const container = document.getElementById('crystal-container');
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});

window.addEventListener('load', () => {
    initThreeJS();
    updateStats();
});
