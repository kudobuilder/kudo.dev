#!/bin/bash
# Copy operator runbooks from the "operators" repository into the site structure.
set -o errexit
set -o pipefail
set -o nounset
#set -o xtrace

site_dir="$(dirname "$(dirname "$(realpath "$0")")")"
checkout_dir=$(mktemp -d)
trap "rm -rf ${checkout_dir}" EXIT

git clone https://github.com/kudobuilder/operators.git "${checkout_dir}"

function embed_docs() {
    local name="$1"
    local source="$2"

    local destination="${site_dir}/content/docs/runbooks/${name}"
    local snippet="${site_dir}/content/.vuepress/${name}.js"

    echo "Embedding ${name} docs from ${source} using ${snippet}" >&2
    rm -rf "${destination}"
    cp -a "${source}" "${destination}"

    echo 'module.exports = { children: [' > "${snippet}"
    # The two find commands are a hack to put installation docs first.
    for file in \
	    $(find "${destination}" -maxdepth 1 -type f -name '*.md' -not -name 'README.md' -name 'instal*' -printf '%f\n') \
	    $(find "${destination}" -maxdepth 1 -type f -name '*.md' -not -name 'README.md' -not -name 'instal*' -printf '%f\n')
    do
        echo "'runbooks/${name}/$(basename "${file}" .md)'," >> "${snippet}"
    done
    echo ']};' >> "${snippet}"
}

embed_docs cassandra "${checkout_dir}/repository/cassandra/3.11/docs"
embed_docs kafka "${checkout_dir}/repository/kafka/docs/latest"
embed_docs spark "${checkout_dir}/repository/spark/docs/latest"
embed_docs elastic "${checkout_dir}/repository/elastic/docs"
