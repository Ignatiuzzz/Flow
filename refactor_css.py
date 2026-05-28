import os
import re

def process_project(src_dir):
    css_files = []
    for root, _, files in os.walk(os.path.join(src_dir, 'styles')):
        for file in files:
            if file.endswith('.css') and file not in ['global.css', 'App.css', 'index.css']:
                css_files.append(os.path.join(root, file))
    tsx_files = []
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                tsx_files.append(os.path.join(root, file))

    for css_file in css_files:
        with open(css_file, 'r', encoding='utf-8') as f:
            css_content = f.read()
        blocks = re.findall(r'([^{]+)\{([^}]+)\}', css_content)
        
        apply_map = {} 
        
        new_css_content = css_content
        for selector_raw, block_content in blocks:
            selector = selector_raw.strip()
           
            
            apply_match = re.search(r'@apply([^;]+);', block_content)
            if apply_match:
                tailwind_classes = apply_match.group(1).strip().split()
    
                mapped_classes = []
                base_selector = None
            
                if re.match(r'^\.[a-zA-Z0-9_-]+$', selector):
                    base_selector = selector[1:] 
                    mapped_classes = tailwind_classes
                elif re.match(r'^\.[a-zA-Z0-9_-]+\s+[a-zA-Z0-9_-]+$', selector):
                    parts = selector.split()
                    base_selector = parts[0][1:]
                    child = parts[1]
                    mapped_classes = [f"[&_{child}]:{c}" for c in tailwind_classes]
                elif re.match(r'^\.[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$', selector):
                    parts = selector.split(':')
                    base_selector = parts[0][1:]
                    pseudo = parts[1]
                    mapped_classes = [f"{pseudo}:{c}" for c in tailwind_classes]
                elif re.match(r'^\.[a-zA-Z0-9_-]+\s+[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$', selector):
                    parts = selector.split()
                    base_selector = parts[0][1:]
                    pseudo_child = parts[1]
                    mapped_classes = [f"[&_{pseudo_child}]:{c}" for c in tailwind_classes]

                if base_selector:
                    if base_selector not in apply_map:
                        apply_map[base_selector] = []
                    apply_map[base_selector].extend(mapped_classes)
                    
                    original_block = block_content
                    new_block = re.sub(r'\s*@apply[^;]+;', '', original_block)
                
                    old_rule = f"{selector_raw}{{{original_block}}}"
                    new_rule = f"{selector_raw}{{{new_block}}}"
                    
                    if not new_block.strip():
                        new_css_content = new_css_content.replace(old_rule, '')
                    else:
                        new_css_content = new_css_content.replace(old_rule, new_rule)

        new_css_content = re.sub(r'\n\s*\n', '\n\n', new_css_content).strip()
        
        if apply_map:
            for tsx_file in tsx_files:
                with open(tsx_file, 'r', encoding='utf-8') as f:
                    tsx_content = f.read()
                
                new_tsx_content = tsx_content
                changed = False
                for base_selector, classes in apply_map.items():
                    classes_str = " ".join(classes)
                  
                    def repl(m):
                        class_attr = m.group(1)
                        class_list = class_attr.split()
                        if base_selector in class_list:

                            for c in classes:
                                if c not in class_list:
                                    class_list.append(c)
                            return f'className="{" ".join(class_list)}"'
                        return m.group(0)

                    old_content = new_tsx_content
                    new_tsx_content = re.sub(r'className="([^"]+)"', repl, new_tsx_content)
                    if old_content != new_tsx_content:
                        changed = True

                if changed:
                    with open(tsx_file, 'w', encoding='utf-8') as f:
                        f.write(new_tsx_content)
        if not new_css_content:
            os.remove(css_file)
            basename = os.path.basename(css_file)
            for tsx_file in tsx_files:
                with open(tsx_file, 'r', encoding='utf-8') as f:
                    tsx_content = f.read()
                lines = tsx_content.split('\n')
                new_lines = [l for l in lines if basename not in l]
                if len(lines) != len(new_lines):
                    with open(tsx_file, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(new_lines))
        else:
            with open(css_file, 'w', encoding='utf-8') as f:
                f.write(new_css_content + '\n')

    print("CSS Refactoring completed!")

if __name__ == '__main__':
    process_project(r'c:\Users\valen\Desktop\Proyectos\Flow\frontend\src')
