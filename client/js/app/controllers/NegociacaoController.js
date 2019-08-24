class NegociacaoController {

    constructor() {

        let $ = document.querySelector.bind(document);

        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');

        this._ordemAtual = '';

        // this._listaNegociacoes = new ListaNegociacoes( model =>
        //     this._negociacaoView.update(model));

        this._listaNegociacoes = new Bind(
            new ListaNegociacoes(),
            new NegociacaoView($('#negociacaoView')),
            'adiciona', 'esvazia', 'ordena', 'inverteOrdem');

        this._mensagem = new Bind(
            new Mensagem(),
            new MensagemView($('#mensagemView')),
            'texto');

        ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.listaTodos())
            .then(negociacoes =>
                negociacoes.forEach(negociacao =>
                    this._listaNegociacoes.adiciona(negociacao)));
    }

    adiciona(event) {

        event.preventDefault();

        ConnectionFactory
            .getConnection()
            .then(conexao => {

                let negociacao = this._criaNegociacao();

                new NegociacaoDao(conexao)
                    .adiciona(negociacao)
                    .then(() => {
                        this._listaNegociacoes.adiciona(negociacao);
                        this._mensagem.texto = 'Negociação adicionada com sucesso';
                        this._limpaFormulario();
                    });
            })
            .catch(erro => this._mensagem.texto = erro);
    }

    importaNegociacoes() {
        let service = new NegociacaoService();

        Promise.all([
            service.obterNegociacoesDaSemana(),
            service.obterNegociacoesDaSemanaAnterior(),
            service.obterNegociacoesDaSemanaRetrasada()]
        ).then(negociacoes => {
            negociacoes
                .reduce((arrayAchatado, array) => arrayAchatado.concat(array), [])
                .forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
            this._mensagem.texto = 'Negociações importadas com sucesso';
        })
            .catch(erro => this._mensagem.texto = erro);


        // service.obterNegociacoesDaSemana().then( negociacoes => {
        //     negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
        //     this._mensagem.texto = 'Negociações importadas com sucesso';
        // }).catch( erro => this._mensagem.texto = erro);

        // service.obterNegociacoesDaSemanaAnterior().then( negociacoes => {
        //     negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
        //     this._mensagem.texto = 'Negociações importadas com sucesso';
        // }).catch( erro => this._mensagem.texto = erro);

        // service.obterNegociacoesDaSemanaRetrasada().then( negociacoes => {
        //     negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
        //     this._mensagem.texto = 'Negociações importadas com sucesso';
        // }).catch( erro => this._mensagem.texto = erro);





        // service.obterNegociacoesDaSemana((erro, negociacoes) => {
        //     if (erro) {
        //         this._mensagem.texto = erro;
        //         return;
        //     }

        //     negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));

        //     service.obterNegociacoesDaSemanaAnterior((erro, negociacoes) => {
        //         if (erro) {
        //             this._mensagem.texto = erro;
        //             return;
        //         }

        //         negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));

        //         service.obterNegociacoesDaSemanaRetrasada((erro, negociacoes) => {
        //             if (erro) {
        //                 this._mensagem.texto = erro;
        //                 return;
        //             }

        //             negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
        //             this._mensagem.texto = 'Negociações importadas com sucesso';
        //         });
        //     });

        // });
    }

    apaga(event) {

        event.preventDefault();

        this._listaNegociacoes.esvazia();

        this._mensagem.texto = 'Negociacões apagadas com sucesso';
    }

    ordena(coluna) {

        if (this._ordemAtual == coluna) {
            this._listaNegociacoes.inverteOrdem();
        } else {
            this._listaNegociacoes.ordena((a, b) => a[coluna] - b[coluna]);
        }
        this._ordemAtual = coluna;
    }

    _limpaFormulario() {

        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;

        this._inputData.focus();
    }

    _criaNegociacao() {

        return new Negociacao(
            DateHelper.textoParaData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value)
        );
    }
}