
export const initialProjectData = {
    rootId: 'root',
    elements: {
        'root': {
            id: 'root',
            tag: 'div',
            classes: 'w-full h-full flex flex-col items-center justify-center bg-[#050510] font-sans text-white p-8',
            children: ['content-wrapper']
        },
        'content-wrapper': {
            id: 'content-wrapper',
            tag: 'div',
            classes: 'text-center max-w-4xl mx-auto',
            children: ['logo-wrapper', 'main-heading', 'sub-description']
        },
        'logo-wrapper': {
            id: 'logo-wrapper',
            tag: 'div',
            classes: 'flex items-center justify-center gap-2 mb-10 opacity-80',
            children: ['logo-text']
        },
        'logo-text': {
            id: 'logo-text',
            tag: 'span',
            classes: 'font-bold text-xl tracking-wide',
            content: 'Galaxy'
        },
        'main-heading': {
            id: 'main-heading',
            tag: 'h1',
            classes: 'text-6xl md:text-7xl font-bold bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent mb-6 leading-tight',
            content: 'Revolutionize your digital SaaS products'
        },
        'sub-description': {
            id: 'sub-description',
            tag: 'p',
            classes: 'text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed',
            content: 'Create stunning, professional-quality websites in record time with our powerful UI kit. Elevate your SAAS game today!'
        }
    }
};
