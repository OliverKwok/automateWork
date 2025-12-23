const fs = require('fs');
const path = require('path');

const EMAIL_MD_FILES_DIR = path.join(__dirname, '..', 'Email_MD_Files');
const RULES_FILE = path.join(__dirname, '..', 'md_rules.json');
const EXCLUDED_DIRS = ['no_need_to_reply', 'replied', 'delivery'];

async function processMdFiles() {
    let rules;
    try {
        const rulesContent = await fs.promises.readFile(RULES_FILE, 'utf8');
        rules = JSON.parse(rulesContent).rules;
    } catch (error) {
        console.error('Error reading or parsing rules file:', error);
        return;
    }

    const titleAndSenderMoveRules = rules.filter(rule => rule.type === 'title_and_sender_move');
    const deliveryRules = rules.filter(rule => rule.type === 'delivery_logic');
    const moveRules = rules.filter(rule => rule.type === 'move_file');
    const metadataRules = rules.filter(rule => rule.type === 'add_metadata');

    let processedFiles = new Set();

    try {
        const rootFiles = await fs.promises.readdir(EMAIL_MD_FILES_DIR);
        const mdFilesToProcess = rootFiles.filter(file => {
            const filePath = path.join(EMAIL_MD_FILES_DIR, file);
            return fs.statSync(filePath).isFile() && file.endsWith('.md');
        });

        // --- TITLE AND SENDER MOVE LOGIC ---
        for (const file of mdFilesToProcess) {
            const fullPath = path.join(EMAIL_MD_FILES_DIR, file);
            let content = await fs.promises.readFile(fullPath, 'utf8');
            const emailTitle = getEmailTitle(path.parse(file).name);
            const sender = extractSender(content);

            for (const rule of titleAndSenderMoveRules) {
                if (emailTitle.includes(rule.params.title.toLowerCase()) && sender === rule.params.sender.toLowerCase()) {
                    const destinationFolder = path.join(EMAIL_MD_FILES_DIR, rule.params.destination_folder);
                    await fs.promises.mkdir(destinationFolder, { recursive: true });
                    const newPath = path.join(destinationFolder, file);
                    if (fs.existsSync(newPath)) {
                        console.log(`'${file}' already exists in '${rule.params.destination_folder}'. Skipping.`);
                    } else {
                        await fs.promises.rename(fullPath, newPath);
                        console.log(`Moved '${file}' to '${rule.params.destination_folder}' based on title and sender.`);
                    }
                    processedFiles.add(file);
                    break;
                }
            }
        }

        // --- DELIVERY LOGIC ---
        const remainingForDelivery = mdFilesToProcess.filter(f => !processedFiles.has(f));
        for (const file of remainingForDelivery) {
            const fullPath = path.join(EMAIL_MD_FILES_DIR, file);
            let content = await fs.promises.readFile(fullPath, 'utf8');

            for (const rule of deliveryRules) {
                const recipients = extractRecipients(content);
                const keywords = rule.condition.values.map(v => v.toLowerCase());
                
                if (recipients.some(recipient => keywords.includes(recipient))) {
                    const checkStrings = Array.isArray(rule.params.check_string) ? rule.params.check_string : [rule.params.check_string];
                    const addressedToMe = checkStrings.some(s => content.toLowerCase().includes(s.toLowerCase()));

                    if (addressedToMe) {
                        const category = rule.params.category_if_present;
                        if (!content.startsWith(`Category: ${category}`)) {
                            let newContent;
                            if (content.startsWith('Category:')) {
                                newContent = `Category: ${category}\n\n${content.substring(content.indexOf('\n\n') + 2)}`;
                            } else {
                                newContent = `Category: ${category}\n\n${content}`;
                            }
                            await fs.promises.writeFile(fullPath, newContent, 'utf8');
                            console.log(`Categorized '${file}' as '${category}' based on delivery logic.`);
                        }
                    } else {
                        const destinationFolder = path.join(EMAIL_MD_FILES_DIR, rule.params.move_folder_if_not_present);
                        await fs.promises.mkdir(destinationFolder, { recursive: true });
                        const newPath = path.join(destinationFolder, file);
                        if (fs.existsSync(newPath)) {
                            console.log(`'${file}' already exists in '${rule.params.move_folder_if_not_present}'. Skipping.`);
                        } else {
                            await fs.promises.rename(fullPath, newPath);
                            console.log(`Moved '${file}' to '${rule.params.move_folder_if_not_present}' based on delivery logic.`);
                        }
                    }
                    processedFiles.add(file);
                    break; 
                }
            }
        }

        // --- MOVE FILES (Standard) ---
        const remainingForMove = mdFilesToProcess.filter(f => !processedFiles.has(f));
        for (const file of remainingForMove) {
            const fullPath = path.join(EMAIL_MD_FILES_DIR, file);
            const emailTitle = getEmailTitle(path.parse(file).name);

            for (const rule of moveRules) {
                 if (rule.condition.field === 'filename_title' && rule.condition.operator === 'contains_any') {
                    const keywords = rule.condition.values.map(v => v.toLowerCase());
                    if (keywords.some(keyword => emailTitle.includes(keyword))) {
                        const destinationFolder = path.join(EMAIL_MD_FILES_DIR, rule.destination_folder);
                        await fs.promises.mkdir(destinationFolder, { recursive: true });
                        const newPath = path.join(destinationFolder, file);
                        if (fs.existsSync(newPath)) {
                           console.log(`'${file}' already exists in '${rule.destination_folder}'. Skipping move.`);
                        } else {
                           await fs.promises.rename(fullPath, newPath);
                           console.log(`Moved '${file}' to '${rule.destination_folder}'`);
                        }
                        processedFiles.add(file);
                        break;
                    }
                }
            }
        }

        // --- CLASSIFY FILES (Standard Metadata) ---
        const remainingForClassification = mdFilesToProcess.filter(f => !processedFiles.has(f));
        for (const file of remainingForClassification) {
            const fullPath = path.join(EMAIL_MD_FILES_DIR, file);
            let content = await fs.promises.readFile(fullPath, 'utf8');
            let categorized = false;

            if (content.startsWith('Category:')) {
                content = content.substring(content.indexOf('\n\n') + 2);
                categorized = true;
            }

            const emailTitle = getEmailTitle(path.parse(file).name);
            let category = 'other';

            for (const rule of metadataRules) {
                 let match = false;
                 const keywords = rule.condition.values.map(v => v.toLowerCase());
                 if (rule.condition.field === 'filename_title' && rule.condition.operator === 'contains_any') {
                     if (keywords.some(keyword => emailTitle.includes(keyword))) {
                         match = true;
                     }
                 } else if (rule.condition.field === 'content' && rule.condition.operator === 'contains_any') {
                     if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
                         match = true;
                     }
                 }

                 if (match) {
                     category = rule.metadata.category;
                     break;
                 }
            }
            
            let newContent;
            if (categorized) {
                newContent = `Category: ${category}\n\n${content}`;
            } else {
                newContent = `Category: ${category}\n\n${content}`;
            }
            await fs.promises.writeFile(fullPath, newContent, 'utf8');
            if(categorized) {
                 console.log(`Re-categorized '${file}' as '${category}'`);
            } else {
                 console.log(`Categorized '${file}' as '${category}'`);
            }
            processedFiles.add(file);
        }

    } catch (error) {
        console.error('Error processing markdown files:', error);
    }
}

function getEmailTitle(filename) {
    const parts = filename.split('_');
    if (parts.length > 2) {
        return parts.slice(2).join(' ').toLowerCase();
    }
    return filename.toLowerCase();
}

function extractRecipients(emailContent) {
    const recipients = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const lines = emailContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('To:') || line.startsWith('Cc:')) {
            const emails = line.match(emailRegex);
            if (emails) recipients.push(...emails.map(e => e.toLowerCase()));
        }
    }
    return recipients;
}

function extractSender(emailContent) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const lines = emailContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('From:')) {
            const emails = line.match(emailRegex);
            if (emails && emails.length > 0) {
                return emails[0].toLowerCase();
            }
        }
    }
    return null;
}

processMdFiles();
