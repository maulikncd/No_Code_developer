// import React from 'react';
// import { useEditor } from './EditorContext';

// const EditorCanvas = () => {
//     const { projectData, selectedElementId, selectElement } = useEditor();

//     const renderElement = (elementId) => {
//         const element = projectData.elements[elementId];
//         if (!element) return null;

//         const isSelected = selectedElementId === elementId;

//         // Prepare props
//         const props = {
//             key: element.id,
//             className: `${element.classes || ''} ${isSelected ? 'outline-2 outline-blue-500 outline-offset-2 relative z-10' : ''} transition-all duration-200 cursor-pointer`,
//             onClick: (e) => {
//                 e.stopPropagation();
//                 selectElement(element.id);
//             },
//             id: element.id, // Helpful for debugging
//             style: { ...element.styles } // Support inline styles if added later
//         };

//         // Handle children
//         let children = null;
//         if (element.content) {
//             children = element.content;
//         } else if (element.children && element.children.length > 0) {
//             children = element.children.map(childId => renderElement(childId));
//         }

//         // Render using React.createElement
//         // Safety check for tag
//         const Tag = element.tag || 'div';

//         return React.createElement(Tag, props, children);
//     };

//     return (
//         <div className="w-full h-full bg-white shadow-sm overflow-auto" onClick={() => selectElement(null)}>
//             {renderElement(projectData.rootId)}
//         </div>
//     );
// };

// export default EditorCanvas;







import React from 'react';
import { useEditor } from './EditorContext';

const EditorCanvas = () => {
    const { projectData, selectedElementId, selectElement } = useEditor();

    const renderElement = (elementId) => {
        const element = projectData.elements[elementId];

        // Agar ID galat hai to crash hone se bachayein
        if (!element) return null;

        const isSelected = selectedElementId === elementId;

        // Props tayyar karein
        const props = {
            key: element.id,
            id: element.id,
            className: `
                ${element.classes || ''} 
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 relative z-20' : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 hover:z-10'} 
                transition-all duration-200 cursor-pointer select-none
            `,
            onClick: (e) => {
                // Ye bohot zaroori hai: Click ko parent tak jaane se rokein
                e.stopPropagation();
                console.log("Clicked:", element.id); // Debugging ke liye
                selectElement(element.id);
            },
            style: { ...element.styles }
        };

        // Children handle karein
        let children = null;
        if (element.content) {
            children = element.content;
        } else if (element.children && element.children.length > 0) {
            children = element.children.map(childId => renderElement(childId));
        }

        const Tag = element.tag || 'div';
        return React.createElement(Tag, props, children);
    };

    return (
        // Wrapper par click karne se Deselect hoga
        <div
            className="w-full h-full bg-white shadow-sm overflow-auto"
            onClick={(e) => {
                console.log("Canvas Wrapper Clicked (Deselect)");
                selectElement(null);
            }}
        >
            {renderElement(projectData.rootId)}
        </div>
    );
};

export default EditorCanvas;