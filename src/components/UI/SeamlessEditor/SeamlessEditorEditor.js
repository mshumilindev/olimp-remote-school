import React, {useContext, useState} from 'react';
import siteSettingsContext from "../../../context/siteSettingsContext";
import classNames from 'classnames';
import * as blocksJSON from './blocks';
import SeamlessEditorPreview from "./SeamlessEditorPreview";
import {Scrollbars} from "react-custom-scrollbars";
import { Editor } from "@tinymce/tinymce-react";
import SeamlessEditorText from "./blocks/SeamlessEditorText";
import SeamlessEditorImage from "./blocks/SeamlessEditorImage";
import SeamlessEditorAudio from "./blocks/SeamlessEditorAudio";
import SeamlessEditorVideo from "./blocks/SeamlessEditorVideo";
import SeamlessEditorYoutube from "./blocks/SeamlessEditorYoutube";
import SeamlessEditorDivider from "./blocks/SeamlessEditorDivider";
import SeamlessEditorGoogleWord from "./blocks/SeamlessEditorGoogleWord";
import SeamlessEditorGoogleExcel from "./blocks/SeamlessEditorGoogleExcel";
import SeamlessEditorGooglePowerpoint from "./blocks/SeamlessEditorGooglePowerpoint";
import SeamlessEditorWord from "./blocks/SeamlessEditorWord";

const blocksData = blocksJSON.default;

export default function SeamlessEditorEditor({title, type, addBlock, setBlock, removeBlock, moveBlock, content, scrollToBlock, setIsEdited}) {
    const { translate, lang } = useContext(siteSettingsContext);
    const [ showType, setShowType ] = useState(null);
    const [ dragBlock, setDragBlock ] = useState(null);
    const [ dragOverBlock, setDragOverBlock ] = useState(null);
    const [ dragOverBlockPosition, setDragOverBlockPosition ] = useState(null);
    const [ textEditorValue, setTextEditorValue ] = useState('');
    const [ dragOverNew, setDragOverNew ] = useState(false);
    const types = [
        {
            icon: 'fas fa-font',
            type: 'text',
        },
        {
            icon: 'fas fa-images',
            type: 'media',
        },
        {
            icon: 'fas fa-file',
            type: 'document',
        },
        {
            icon: 'fab fa-google-drive',
            type: 'googleDrive',
        },
        {
            icon: 'fas fa-infinity',
            type: 'other',
        }
    ];
    const typeBlocks = {
        text: [
            {
                icon: 'fas fa-font',
                block: 'text'
            }
        ],
        media: [
            {
                icon: 'fas fa-image',
                block: 'image'
            },
            {
                icon: 'fas fa-headphones',
                block: 'audio'
            },
            {
                icon: 'fas fa-video',
                block: 'video'
            },
            {
                icon: 'fab fa-youtube',
                block: 'youtube'
            }
        ],
        document: [
            {
                icon: 'fas fa-file-word',
                block: 'word'
            }
        ],
        googleDrive: [
            {
                icon: 'fas fa-file-word',
                block: 'googleWord'
            },
            {
                icon: 'fas fa-file-excel',
                block: 'googleExcel'
            },
            {
                icon: 'fas fa-file-powerpoint',
                block: 'googlePowerpoint'
            }
        ],
        other: [
            {
                icon: 'fa fa-divide',
                block: 'divider'
            }
        ]
    };

    return (
        <div className="seamlessEditor__editor">
            <div className="seamlessEditor__editor-header">
                { _renderTitle() }
                { _renderActions() }
            </div>
            <div className="seamlessEditor__editor-body">
                { _renderTypes() }
                { _renderBlocks() }
                {
                    content.length ?
                        <SeamlessEditorPreview content={content} scrollToBlock={scrollToBlock} moveBlock={moveBlock} removeBlock={removeBlock}/>
                        :
                        null
                }
            </div>
        </div>
    );

    function _renderActions() {
        return (
            <div className="seamlessEditor__editor-actions">
                <div className="seamlessEditor__editor-actions-item">
                    <div className="seamlessEditor__editor-btn" onClick={() => setIsEdited(false)}>
                        <i className="fas fa-times" />
                        { translate('close') }
                    </div>
                </div>
            </div>
        )
    }

    function _renderTypes() {
        return (
            <>
                <div className="seamlessEditor__editor-types">
                    { types.map(item => _renderType(item)) }
                </div>
                {
                    showType ?
                        _renderTypeBlocks()
                        :
                        null
                }
            </>
        )
    }

    function _renderType(item) {
        return (
            <div className="seamlessEditor__editor-types-item" key={'type' + item.type}>
                <div className={classNames('seamlessEditor__editor-btn', {active: showType === item.type})} onClick={() => setShowType(showType === item.type ? null : item.type)}>
                    <i className={item.icon} />
                    { translate(item.type) }
                </div>
            </div>
        )
    }

    function _renderTypeBlocks() {
        return (
            <div className="seamlessEditor__editor-type">
                {
                    typeBlocks[showType].map(item => _renderTypeBlock(item))
                }
            </div>
        )
    }

    function _renderTypeBlock(item) {
        return (
            <div className="seamlessEditor__editor-type-item" key={'typeBlock' + item.block} draggable onDragStart={() => setDragBlock(item.block)} onDragEnd={handleDragEnd}>
                <div className="seamlessEditor__editor-btn" onClick={() => addBlock(getNewBlock(item.block), content.length)}>
                    <i className={item.icon} />
                    { translate(item.block) }
                </div>
            </div>
        )
    }

    function _renderTitle() {
        return (
            <div className="seamlessEditor__editor-title">
                <i className="content_title-icon fa fa-paragraph"/>
                <div className="seamlessEditor__editor-title-inner">
                    { title }
                    <span>{ translate(type) }</span>
                </div>
            </div>
        )
    }

    function _renderBlocks() {
        return (
            <div className="seamlessEditor__editor-blocks-holder">
                <Scrollbars
                    autoHeight
                    hideTracksWhenNotNeeded
                    autoHeightMax={'100%'}
                    renderTrackVertical={props => <div {...props} className="scrollbar__track"/>}
                    renderView={props => <div {...props} className="scrollbar__content"/>}
                >
                    <div className="seamlessEditor__editor-blocks-inner">
                        <div className="seamlessEditor__editor-blocks">
                            {
                                !content.length ?
                                    _renderNewBlock()
                                    :
                                    content.map((item, index) => _renderBlock(item, index))
                            }
                        </div>
                    </div>
                </Scrollbars>
                {
                    textEditorValue ?
                        _renderTextEditor()
                        :
                        null
                }
            </div>
        )
    }

    function _renderNewBlock() {
        return (
            <div className={classNames('seamlessEditor__editor-block isNew', {isOver: dragOverNew})} onDragLeave={() => setTimeout(() => { setDragOverNew(false)}, 0)} onDragEnter={() => setDragOverNew(true)}>
                <div className="seamlessEditor__editor-block-inner">
                    { translate('seamlessEditor_drag_block_here') }
                </div>
            </div>
        )
    }

    function _renderBlock(item, index) {
        return (
            <div className="seamlessEditor__editor-block-holder" onDragEnter={() => setDragOverBlock(item.id)} key={'block' + item.id} id={'block' + item.id}>
                {
                    dragBlock && index === 0 ?
                        _renderDropArea(item.id, 'before')
                        :
                        null
                }
                <div className="seamlessEditor__editor-block">
                    <div className="seamlessEditor__editor-block-inner">
                        { getBlock(item) }
                    </div>
                </div>
                {
                    dragBlock ?
                        _renderDropArea(item.id, 'after')
                        :
                        null
                }
            </div>
        )
    }

    function _renderDropArea(blockID, position) {
        return (
            <div className={classNames('seamlessEditor__editor-block dropArea', {isOver: dragOverBlock === blockID && dragOverBlockPosition === position})} onDragLeave={() => setTimeout(() => { setDragOverBlockPosition(null)}, 0)} onDragEnter={() => setDragOverBlockPosition(position)}>
                <div className="seamlessEditor__editor-block-inner">
                    { translate('drop_block_here') }
                </div>
            </div>
        )
    }

    function _renderTextEditor() {
        const editorToolbar = ['undo redo | formatselect | forecolor | fontselect | fontsizeselect | numlist bullist | align | bold italic underline strikeThrough subscript superscript | table tabledelete tableprops tablerowprops tablecellprops tableinsertrowbefore tableinsertrowafter tabledeleterow tableinsertcolbefore tableinsertcolafter tabledeletecol | tiny_mce_wiris_formulaEditor | tiny_mce_wiris_formulaEditorChemistry'];

        const editorConfig = {
            menubar: false,
            language: 'uk',
            max_height: 300,
            plugins: [
                'autoresize fullscreen',
                'advlist lists image charmap anchor',
                'visualblocks',
                'paste',
                'table'
            ],
            external_plugins: {
                'tiny_mce_wiris' : 'https://cdn.jsdelivr.net/npm/@wiris/mathtype-tinymce4@7.17.0/plugin.min.js'
            },
            paste_word_valid_elements: "b,strong,i,em,h1,h2,u,p,ol,ul,li,a[href],span,color,font-size,font-color,font-family,mark,table,tr,td",
            paste_retain_style_properties: "all",
            fontsize_formats: "8 9 10 11 12 14 16 18 20 22 24 26 28 36 48 72",
            toolbar: editorToolbar,
            placeholder: translate('enter_text')
        };

        return (
            <div className="seamlessEditor__textEditor-holder">
                <div className="seamlessEditor__textEditor-box">
                    <div className="seamlessEditor__textEditor">
                        <Editor
                            value={textEditorValue.value[lang]}
                            onEditorChange={textEditorChange}
                            init={editorConfig}
                            apiKey="5wvj56289tu06v7tziccawdyxaqxkmsxzzlrh6z0aia0pm8y"
                        />
                    </div>
                    <div className="seamlessEditor__textEditor-close" onClick={() => setTextEditorValue(null)}>
                        <i className="fas fa-check" />
                    </div>
                </div>
            </div>
        )
    }

    function textEditorChange(value) {
        textEditorValue.value[lang] = value;
        setBlock(textEditorValue);
    }

    function getBlock(block) {
        switch (block.type) {
            // === Text
            case 'text':
                return <SeamlessEditorText block={block} openTextEditor={openTextEditor}/>;

            // === Media
            case 'media':
            case 'image':
                return <SeamlessEditorImage block={block} setBlock={setBlock}/>;

            case 'audio':
                return <SeamlessEditorAudio block={block} setBlock={setBlock}/>;

            case 'video':
                return <SeamlessEditorVideo block={block} setBlock={setBlock}/>;

            case 'youtube':
                return <SeamlessEditorYoutube block={block} setBlock={setBlock}/>;

            // === Document
            case 'word':
                return <SeamlessEditorWord block={block} setBlock={setBlock} openTextEditor={openTextEditor}/>;

            // === Google Drive
            case 'googleWord':
                return <SeamlessEditorGoogleWord block={block} setBlock={setBlock}/>;

            case 'googleExcel':
                return <SeamlessEditorGoogleExcel block={block} setBlock={setBlock}/>;

            case 'googlePowerpoint':
                return <SeamlessEditorGooglePowerpoint block={block} setBlock={setBlock}/>;

            // === Other
            case 'divider':
                return <SeamlessEditorDivider/>;
        }
    }

    function handleDragEnd() {
        if ( dragOverNew ) {
            addBlock(getNewBlock(dragBlock), 0);
        }
        else {
            if ( dragBlock && dragOverBlock && dragOverBlockPosition ) {
                const index = content.indexOf(content.find(item => item.id === dragOverBlock));
                let newPosition = null;

                if ( dragOverBlockPosition === 'before' ) {
                    if ( index === 0 ) {
                        newPosition = 0;
                    }
                    else {
                        newPosition = index - 1;
                    }
                }
                else {
                    if ( index === content.length - 1 ) {
                        newPosition = content.length;
                    }
                    else {
                        newPosition = index + 1;
                    }
                }

                addBlock(getNewBlock(dragBlock), newPosition);
            }
        }
        setDragBlock(null);
        setDragOverBlock(null);
        setDragOverBlockPosition(null);
        setDragOverNew(false);
    }

    function getNewBlock(type) {
        return JSON.parse(JSON.stringify(blocksData[type]));
    }

    function openTextEditor(block) {
        setTextEditorValue(Object.assign({}, block));
    }
}