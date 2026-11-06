import { StyleSheet } from "react-native";

export const stylesMensagemTelaCheia = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    texto: {
        fontSize: 64,
        lineHeight: 72,
        fontWeight: '800',
        textAlign: 'center',
    },
    ajudaRetorno: {
        marginTop: 24,
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '600',
        textAlign: 'center',
    },
});