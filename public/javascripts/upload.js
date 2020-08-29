FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    stylePanelAspectRatio: 70 / 70
})

FilePond.parse(document.body)